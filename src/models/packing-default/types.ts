import { Timestamp } from 'firebase/firestore'

export type TPackingDefault = {
  id: string
  supplierId: string
  productId: string
  packing: string
  packingQuantity: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
