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
  // Missing in invoices imported before these fields were added.
  tribUnit: string | null
  tribQuantity: number | null
  tribUnitPrice: number | null
  // Total cost with taxes and expenses (vProd - vDesc + vFrete + vSeg + vOutro
  // + vIPI + vICMSST + vFCPST). Missing in invoices imported before these
  // fields were added.
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
  // <natOp>; missing in invoices imported before the field was added.
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
  completed: TInvoice[]
}
