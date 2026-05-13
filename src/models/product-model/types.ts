export type TProduct = {
  id: string
  description: string
  price: number
  purchasePrice: number
  quantity: number
  packaging: string | null
  barcode: string | null
  tax: number | null
  margin: number | null
  observation: string | null
  expirationDate: string | null
  familyId: string | null
  supplierIds: string[]
  sellerIds: string[]
  createdAt: number
  updatedAt: number
}
