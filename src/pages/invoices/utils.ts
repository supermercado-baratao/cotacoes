import type {
  TInvoice,
  TInvoiceItem,
  TInvoiceItemMatchStatus
} from '@/models/invoice-model/types'
import type { TPackageBarcodeLink } from '@/models/package-barcode-link-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TQuoteItem } from '@/models/quote-model/types'
import { groupBy } from '@/utils/group-by'
import { buildPackageBarcodeLinkMap } from '@/utils/package-barcode-links'
import { isLikelyMatch } from '@/utils/quote-item-match'
import { matchesSearch } from '@/utils/search'

const hasAllOrdersLinked = (invoice: TInvoice): boolean =>
  invoice.items.every((item) => item.orderId !== null)

const invoiceSortRank = (invoice: TInvoice): number => {
  if (invoice.verificationStatus !== 'pending') return 2
  return hasAllOrdersLinked(invoice) ? 1 : 0
}

export const filterInvoices = (
  search: string,
  invoices: TInvoice[]
): TInvoice[] =>
  invoices
    .filter(
      (inv) =>
        matchesSearch(search, inv.number, inv.supplierName) ||
        inv.items.some((item) =>
          matchesSearch(
            search,
            item.description,
            item.barcode,
            item.calculatedBarcode,
            item.packageBarcode,
            item.supplierProductCode,
            item.productId
          )
        )
    )
    .toSorted((a, b) => invoiceSortRank(a) - invoiceSortRank(b))

export const findBestQuoteItemMatch = (
  item: TInvoiceItem,
  quoteItems: TQuoteItem[],
  productMap: Map<string, TProduct>
): TQuoteItem | null => {
  if (!item.productId) return null
  return (
    quoteItems.find((quoteItem) =>
      isLikelyMatch(item, quoteItem, productMap)
    ) ?? null
  )
}

export type TLinkOrderRow = {
  item: TInvoiceItem
  productId: string | null
  quoteItemId: string
}

export type TBatchGroup = {
  quoteItemId: string
  packing: string
  rows: TLinkOrderRow[]
  outliers: TLinkOrderRow[]
}

export type TGroupedRows = {
  batchGroups: TBatchGroup[]
  individualRows: TLinkOrderRow[]
}

/**
 * Groups invoice rows that are ready to link into batches that can be
 * confirmed together: same quote item, referenced by family (so more than
 * one product can legitimately share it), same product family (a manual
 * override can point rows for different families/packagings at the same
 * quote item, so the family is re-checked from the product, not assumed
 * from the quote item), and consistent packing across the rows. Rows whose
 * packing diverges from the group's majority are never silently merged in
 * — they're returned in `individualRows` instead.
 */
export const groupInvoiceItemsForBatch = (
  readyRows: TLinkOrderRow[],
  quoteItems: TQuoteItem[],
  products: TProduct[]
): TGroupedRows => {
  const quoteItemMap = new Map(quoteItems.map((qi) => [qi.id, qi]))
  const productMap = new Map(products.map((p) => [p.id, p]))

  const rowsByQuoteItemId = groupBy(readyRows, (row) => row.quoteItemId)

  const batchGroups: TBatchGroup[] = []
  const individualRows: TLinkOrderRow[] = []

  for (const [quoteItemId, rows] of rowsByQuoteItemId) {
    const isFamilyRef =
      quoteItemMap.get(quoteItemId)?.priceRef?.type === 'family'
    if (!isFamilyRef || rows.length < 2) {
      individualRows.push(...rows)
      continue
    }

    const rowsByFamily = groupBy(rows, (row) => {
      const familyId = row.productId
        ? productMap.get(row.productId)?.familyId
        : null
      return familyId ?? `product:${row.productId}`
    })

    for (const familyRows of rowsByFamily.values()) {
      if (familyRows.length < 2) {
        individualRows.push(...familyRows)
        continue
      }

      const rowsByPacking = groupBy(familyRows, (row) => row.item.unit)

      let majorityPacking: string | null = null
      let majorityRows: TLinkOrderRow[] = []
      for (const [packing, bucket] of rowsByPacking) {
        if (bucket.length <= majorityRows.length) continue

        majorityPacking = packing
        majorityRows = bucket
      }

      if (majorityPacking !== null && majorityRows.length >= 2) {
        const outliers = familyRows.filter(
          (row) => row.item.unit !== majorityPacking
        )
        batchGroups.push({
          quoteItemId,
          packing: majorityPacking,
          rows: majorityRows,
          outliers
        })
        individualRows.push(...outliers)
      } else {
        individualRows.push(...familyRows)
      }
    }
  }

  return { batchGroups, individualRows }
}

const get = (root: Document | Element, tag: string): string =>
  root.querySelector(tag)?.textContent?.trim() ?? ''

const parseAccessKey = (xml: Document): string => {
  const id = xml.querySelector('infNFe')?.getAttribute('Id') ?? ''
  return id.startsWith('NFe') ? id.slice(3) : id
}

const normalizeBarcode = (raw: string): string | null =>
  !raw || raw === 'SEM GTIN' || raw === '0' ? null : raw

const normalizeCnpj = (cnpj: string): string => cnpj.replaceAll(/\D/g, '')

export const calcUnitBarcode = (packingBarcode: string) => {
  const array = packingBarcode.slice(1, -1).split('')
  const sum = array.reduce(
    (total, number, index) =>
      total + (index % 2 === 0 ? Number(number) * 1 : Number(number) * 3),
    0
  )
  const lastDigit = ((Math.floor(sum / 10) + 1) * 10 - sum) % 10
  const bar = array.join('') + lastDigit
  return bar
}

const buildBarcodeMap = (products: TProduct[]): Map<string, TProduct> => {
  const barcodeMap = new Map<string, TProduct>()
  for (const product of products) {
    for (const barcode of product.barcodes) {
      barcodeMap.set(barcode, product)
    }
  }
  return barcodeMap
}

const getNumber = (root: Element | undefined, tag: string): number =>
  root ? Number(get(root, tag)) || 0 : 0

// Custo total do item com impostos e despesas acessórias — mesma composição
// do custo com imposto do VR (sem abater créditos), pra que o custo médio
// das notas seja comparável ao produtocomplemento.custocomimposto.
const calcItemTotalCost = (det: Element, productElement: Element): number => {
  const imposto = det.querySelector('imposto')
  const ipi = imposto?.querySelector('IPI') ?? undefined
  const icms = imposto?.querySelector('ICMS') ?? undefined
  const total =
    getNumber(productElement, 'vProd') -
    getNumber(productElement, 'vDesc') +
    getNumber(productElement, 'vFrete') +
    getNumber(productElement, 'vSeg') +
    getNumber(productElement, 'vOutro') +
    getNumber(ipi, 'vIPI') +
    getNumber(icms, 'vICMSST') +
    getNumber(icms, 'vFCPST')
  return Math.round(total * 100) / 100
}

const parseItems = (
  xml: Document,
  barcodeMap: Map<string, TProduct>,
  packageBarcodeLinkMap: Map<string, string>
): TInvoiceItem[] =>
  [...xml.querySelectorAll('det')].map((det, index) => {
    const productElement = det.querySelector('prod')!
    const cEAN = normalizeBarcode(get(productElement, 'cEAN'))
    const cEANTrib = normalizeBarcode(get(productElement, 'cEANTrib'))
    const supplierProductCode = get(productElement, 'cProd')
    const description = get(productElement, 'xProd')

    const calculatedBarcode =
      cEAN && cEAN.length === 14 ? calcUnitBarcode(cEAN) : null

    const isDuplicatedPackaging = !!cEAN && cEAN === cEANTrib

    const product =
      (cEANTrib && barcodeMap.get(cEANTrib)) ||
      (cEAN && barcodeMap.get(cEAN)) ||
      (calculatedBarcode && barcodeMap.get(calculatedBarcode)) ||
      null

    const linkedProductId = cEAN && packageBarcodeLinkMap.get(cEAN)
    const productId = product?.id ?? linkedProductId ?? null

    const matchStatus: TInvoiceItemMatchStatus = productId
      ? 'matched'
      : 'unmatched_product'

    return {
      itemNumber: index + 1,
      supplierProductCode,
      barcode: isDuplicatedPackaging ? calculatedBarcode : cEANTrib,
      calculatedBarcode,
      packageBarcode: cEAN,
      description,
      unit: get(productElement, 'uCom'),
      quantity: Number(get(productElement, 'qCom')),
      unitPrice: Number(get(productElement, 'vUnCom')),
      totalPrice: Number(get(productElement, 'vProd')),
      tribUnit: get(productElement, 'uTrib'),
      tribQuantity: Number(get(productElement, 'qTrib')),
      tribUnitPrice: Number(get(productElement, 'vUnTrib')),
      cfop: get(productElement, 'CFOP') || null,
      totalCost: calcItemTotalCost(det, productElement),
      productId,
      orderId: null,
      matchStatus,
      priceDivergence: null,
      quantityDivergence: null
    }
  })

export type TParsedNfe = Omit<TInvoice, 'createdAt' | 'updatedAt'>

export const parseNfe = (
  xmlString: string,
  products: TProduct[],
  packageBarcodeLinks: TPackageBarcodeLink[] = []
): TParsedNfe => {
  const xml = new DOMParser().parseFromString(xmlString, 'text/xml')

  if (xml.querySelector('parsererror')) {
    throw new Error('Arquivo XML inválido')
  }

  const accessKey = parseAccessKey(xml)
  if (!accessKey || accessKey.length !== 44) {
    throw new Error('Chave de acesso NFe inválida ou ausente no arquivo')
  }

  const cnpjEls = [...xml.querySelectorAll('CNPJ')]
  const supplierCnpj = normalizeCnpj(cnpjEls[0]?.textContent?.trim() ?? '')
  const destinationCnpj = normalizeCnpj(cnpjEls[1]?.textContent?.trim() ?? '')

  const supplierName = get(xml, 'xFant') || get(xml, 'xNome')

  const barcodeMap = buildBarcodeMap(products)
  const packageBarcodeLinkMap = buildPackageBarcodeLinkMap(packageBarcodeLinks)

  return {
    id: accessKey,
    accessKey,
    number: get(xml, 'nNF'),
    series: get(xml, 'serie'),
    emissionDate: get(xml, 'dhEmi'),
    supplierCnpj,
    supplierName,
    operationNature: get(xml, 'natOp') || null,
    destinationCnpj,
    totalValue: Number(get(xml, 'vNF')),
    items: parseItems(xml, barcodeMap, packageBarcodeLinkMap),
    verificationStatus: 'pending',
    quoteId: null
  }
}
