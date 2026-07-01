import type {
  TInvoice,
  TInvoiceItem,
  TInvoiceItemMatchStatus,
  TProduct
} from '@/models'

const get = (root: Document | Element, tag: string): string =>
  Array.from(root.getElementsByTagName(tag))[0]?.textContent?.trim() ?? ''

const parseAccessKey = (doc: Document): string => {
  const id = doc.getElementsByTagName('infNFe')[0]?.getAttribute('Id') ?? ''
  return id.startsWith('NFe') ? id.slice(3) : id
}

const normalizeBarcode = (raw: string): string | null =>
  !raw || raw === 'SEM GTIN' || raw === '0' ? null : raw

const normalizeCnpj = (cnpj: string): string => cnpj.replace(/\D/g, '')

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

    const product =
      (cEAN && barcodeMap.get(cEAN)) ||
      (cEANTrib && barcodeMap.get(cEANTrib)) ||
      null

    const matchStatus: TInvoiceItemMatchStatus = product
      ? 'matched'
      : 'unmatched_product'

    return {
      itemNumber: i + 1,
      supplierProductCode: cProd,
      barcode: cEAN,
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
