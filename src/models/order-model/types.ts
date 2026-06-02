import type { TQuoteItemType } from '../quote-model'

export type TOrder = {
  id: string
  quoteId: string
  quoteItemId: string
  quoteItemType: TQuoteItemType
  productId: string
  price: number
  quantity: number
  packing: string
  supplierId: string
  sellerId: string | null
  date: string
  observations: string | null
  createdAt: number
  updatedAt: number
}
