import { Timestamp } from 'firebase/firestore'

export type TInvoiceVerificationStatus = 'pending' | 'approved' | 'divergent'

export type TInvoiceItemMatchStatus =
  | 'matched'
  | 'unmatched_product'
  | 'unmatched_order'

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
  destinationCnpj: string
  totalValue: number
  items: TInvoiceItem[]
  verificationStatus: TInvoiceVerificationStatus
  quoteId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
