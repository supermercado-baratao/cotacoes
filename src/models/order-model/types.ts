export type TOrder = {
  id: string
  quoteId: string
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
