import type {
  TInvoice,
  TInvoiceItem,
  TInvoiceItemMatchStatus,
  TProduct,
  TSupplier
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

const parseItems = (
  doc: Document,
  productMap: Map<string, TProduct>
): TInvoiceItem[] =>
  Array.from(doc.getElementsByTagName('det')).map((det, i) => {
    const prod = det.getElementsByTagName('prod')[0]
    const barcode = normalizeBarcode(get(prod, 'cEAN'))
    const product = barcode ? (productMap.get(barcode) ?? null) : null
    const matchStatus: TInvoiceItemMatchStatus = product
      ? 'matched'
      : 'unmatched_product'

    return {
      itemNumber: i + 1,
      supplierProductCode: get(prod, 'cProd'),
      barcode,
      description: get(prod, 'xProd'),
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

export type TParsedNfe = Omit<TInvoice, 'createdAt' | 'updatedAt' | 'origin'>

export const parseNfe = (
  xmlString: string,
  products: TProduct[],
  suppliers: TSupplier[]
): TParsedNfe => {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml')

  if (doc.getElementsByTagName('parsererror').length > 0) {
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

  const productMap = new Map(
    products.filter((p) => p.barcode).map((p) => [p.barcode!, p])
  )
  const supplierByCnpj = new Map(
    suppliers.map((s) => [normalizeCnpj(s.cnpj), s])
  )

  return {
    id: accessKey,
    accessKey,
    number: get(doc, 'nNF'),
    series: get(doc, 'serie'),
    emissionDate: get(doc, 'dhEmi'),
    supplierCnpj,
    supplierName,
    supplierId: supplierByCnpj.get(supplierCnpj)?.id ?? null,
    destinationCnpj,
    totalValue: Number(get(doc, 'vNF')),
    items: parseItems(doc, productMap),
    verificationStatus: 'pending',
    quoteId: null
  }
}
