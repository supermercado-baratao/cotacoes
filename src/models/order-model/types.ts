import { Timestamp } from 'firebase/firestore'

export type TOrder = {
  id: string
  quoteId: string
  quoteItemId: string
  productId: string
  invoiceId: string | null
  price: number
  quantity: number
  packing: string
  supplierId: string
  sellerId: string | null
  date: string
  observations: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
