export type TProduct = {
  id: string
  vrId: string
  description: string
  price: number
  barcode: string | null
  tax: number | null
  margin: number | null
  observations: string | null
  familyId: string | null
  groupId: string | null
  supplierIds: string[]
  createdAt: number
  updatedAt: number
}
