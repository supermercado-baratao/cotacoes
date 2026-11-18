import { Timestamp } from 'firebase/firestore'

export type TInvoiceDateRange = {
  startDate: string
  endDate: string
}

export type TInvoiceVerificationStatus = 'pending' | 'approved' | 'divergent'

export type TInvoiceItemMatchStatus =
  'matched' | 'unmatched_product' | 'unmatched_order'

export type TInvoiceItem = {
  itemNumber: number
  supplierProductCode: string
  barcode: string | null
  calculatedBarcode: string | null
  packageBarcode: string | null
  description: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  // Notas importadas antes da adição desses campos não os possuem no Firestore.
  tribUnit: string | null
  tribQuantity: number | null
  tribUnitPrice: number | null
  // CFOP do item e custo total com impostos/despesas (vProd - vDesc + vFrete
  // + vSeg + vOutro + vIPI + vICMSST + vFCPST). Ausentes em notas importadas
  // antes da adição desses campos.
  cfop?: string | null
  totalCost?: number | null
  productId: string | null
  orderId: string | null
  matchStatus: TInvoiceItemMatchStatus
  priceDivergence: number | null
  quantityDivergence: number | null
}

export type TInvoice = {
  id: string
  accessKey: string
  number: string
  series: string
  emissionDate: string
  supplierCnpj: string
  supplierName: string
  // <natOp> — ausente em notas importadas antes da adição do campo.
  operationNature?: string | null
  destinationCnpj: string
  totalValue: number
  items: TInvoiceItem[]
  verificationStatus: TInvoiceVerificationStatus
  quoteId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type TInvoiceImportResult = {
  created: TInvoice[]
  // Notas já gravadas que estavam sem os dados fiscais adicionados depois
  // (CFOP, natureza da operação, custo com impostos...) e foram completadas
  // com o XML reenviado, preservando vínculos e conferência.
  completed: TInvoice[]
}
