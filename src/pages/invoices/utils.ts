import type {
  TInvoice,
  TInvoiceItem,
  TInvoiceItemMatchStatus,
  TPackageBarcodeLink,
  TProduct,
  TQuoteItem
} from '@/models'
import {
  buildPackageBarcodeLinkMap,
  isLikelyMatch,
  matchesSearch
} from '@/utils'

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
            item.supplierProductCode
          )
        )
    )
    .sort((a, b) => invoiceSortRank(a) - invoiceSortRank(b))

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

  const rowsByQuoteItemId = new Map<string, TLinkOrderRow[]>()
  for (const row of readyRows) {
    const group = rowsByQuoteItemId.get(row.quoteItemId) ?? []
    group.push(row)
    rowsByQuoteItemId.set(row.quoteItemId, group)
  }

  const batchGroups: TBatchGroup[] = []
  const individualRows: TLinkOrderRow[] = []

  for (const [quoteItemId, rows] of rowsByQuoteItemId) {
    const isFamilyRef =
      quoteItemMap.get(quoteItemId)?.priceRef?.type === 'family'
    if (!isFamilyRef || rows.length < 2) {
      individualRows.push(...rows)
      continue
    }

    const rowsByFamily = new Map<string, TLinkOrderRow[]>()
    for (const row of rows) {
      const familyId = row.productId
        ? productMap.get(row.productId)?.familyId
        : null
      const familyKey = familyId ?? `product:${row.productId}`
      const bucket = rowsByFamily.get(familyKey) ?? []
      bucket.push(row)
      rowsByFamily.set(familyKey, bucket)
    }

    for (const familyRows of rowsByFamily.values()) {
      if (familyRows.length < 2) {
        individualRows.push(...familyRows)
        continue
      }

      const rowsByPacking = new Map<string, TLinkOrderRow[]>()
      for (const row of familyRows) {
        const bucket = rowsByPacking.get(row.item.unit) ?? []
        bucket.push(row)
        rowsByPacking.set(row.item.unit, bucket)
      }

      let majorityPacking: string | null = null
      let majorityRows: TLinkOrderRow[] = []
      for (const [packing, bucket] of rowsByPacking) {
        if (bucket.length > majorityRows.length) {
          majorityPacking = packing
          majorityRows = bucket
        }
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
  Array.from(root.getElementsByTagName(tag))[0]?.textContent?.trim() ?? ''

const parseAccessKey = (doc: Document): string => {
  const id = doc.getElementsByTagName('infNFe')[0]?.getAttribute('Id') ?? ''
  return id.startsWith('NFe') ? id.slice(3) : id
}

const normalizeBarcode = (raw: string): string | null =>
  !raw || raw === 'SEM GTIN' || raw === '0' ? null : raw

const normalizeCnpj = (cnpj: string): string => cnpj.replace(/\D/g, '')

export const calcUnitBarcode = (packingBarcode: string) => {
  const array = packingBarcode.slice(1, -1).split('')
  const sum = array.reduce(
    (total, number, i) =>
      total + (i % 2 === 0 ? Number(number) * 1 : Number(number) * 3),
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

const parseItems = (
  doc: Document,
  barcodeMap: Map<string, TProduct>,
  packageBarcodeLinkMap: Map<string, string>
): TInvoiceItem[] =>
  Array.from(doc.getElementsByTagName('det')).map((det, i) => {
    const prod = det.getElementsByTagName('prod')[0]
    const cEAN = normalizeBarcode(get(prod, 'cEAN'))
    const cEANTrib = normalizeBarcode(get(prod, 'cEANTrib'))
    const cProd = get(prod, 'cProd')
    const xProd = get(prod, 'xProd')

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
      itemNumber: i + 1,
      supplierProductCode: cProd,
      barcode: isDuplicatedPackaging ? calculatedBarcode : cEANTrib,
      calculatedBarcode,
      packageBarcode: cEAN,
      description: xProd,
      unit: get(prod, 'uCom'),
      quantity: Number(get(prod, 'qCom')),
      unitPrice: Number(get(prod, 'vUnCom')),
      totalPrice: Number(get(prod, 'vProd')),
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
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml')

  if (doc.getElementsByTagName('parseerror').length > 0) {
    throw new Error('Arquivo XML inválido')
  }

  const accessKey = parseAccessKey(doc)
  if (!accessKey || accessKey.length !== 44) {
    throw new Error('Chave de acesso NFe inválida ou ausente no arquivo')
  }

  const cnpjEls = Array.from(doc.getElementsByTagName('CNPJ'))
  const supplierCnpj = normalizeCnpj(cnpjEls[0]?.textContent?.trim() ?? '')
  const destinationCnpj = normalizeCnpj(cnpjEls[1]?.textContent?.trim() ?? '')

  const supplierName = get(doc, 'xFant') || get(doc, 'xNome')

  const barcodeMap = buildBarcodeMap(products)
  const packageBarcodeLinkMap = buildPackageBarcodeLinkMap(packageBarcodeLinks)

  return {
    id: accessKey,
    accessKey,
    number: get(doc, 'nNF'),
    series: get(doc, 'serie'),
    emissionDate: get(doc, 'dhEmi'),
    supplierCnpj,
    supplierName,
    destinationCnpj,
    totalValue: Number(get(doc, 'vNF')),
    items: parseItems(doc, barcodeMap, packageBarcodeLinkMap),
    verificationStatus: 'pending',
    quoteId: null
  }
}
