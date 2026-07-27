import type {
  TInvoice,
  TInvoiceItem,
  TInvoiceItemMatchStatus,
  TProduct,
  TQuoteItem
} from '@/models'
import { isLikelyMatch, matchesSearch } from '@/utils'

export const filterInvoices = (
  search: string,
  invoices: TInvoice[]
): TInvoice[] =>
  invoices.filter(
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
 * one product can legitimately share it), and consistent packing across the
 * rows. Rows whose packing diverges from the group's majority are never
 * silently merged in — they're returned in `individualRows` instead.
 */
export const groupInvoiceItemsForBatch = (
  readyRows: TLinkOrderRow[],
  quoteItems: TQuoteItem[]
): TGroupedRows => {
  const quoteItemMap = new Map(quoteItems.map((qi) => [qi.id, qi]))

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

    const rowsByPacking = new Map<string, TLinkOrderRow[]>()
    for (const row of rows) {
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
      const outliers = rows.filter((row) => row.item.unit !== majorityPacking)
      batchGroups.push({
        quoteItemId,
        packing: majorityPacking,
        rows: majorityRows,
        outliers
      })
      individualRows.push(...outliers)
    } else {
      individualRows.push(...rows)
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
  barcodeMap: Map<string, TProduct>
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

    const matchStatus: TInvoiceItemMatchStatus = product
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
      productId: product?.id ?? null,
      orderId: null,
      matchStatus,
      priceDivergence: null,
      quantityDivergence: null
    }
  })

export type TParsedNfe = Omit<TInvoice, 'createdAt' | 'updatedAt'>

export const parseNfe = (
  xmlString: string,
  products: TProduct[]
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
    items: parseItems(doc, barcodeMap),
    verificationStatus: 'pending',
    quoteId: null
  }
}
