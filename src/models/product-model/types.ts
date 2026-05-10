export type TProduct = {
  id: string
  description: string
  price: number
  purchasePrice: number
  quantity: number
  packaging?: string
  supplier?: string
  barcode?: string
  tax?: number
  margin?: number
  observation?: string
  expirationDate?: string
  family?: string
  updatedAt: number
  createdAt: number
}
