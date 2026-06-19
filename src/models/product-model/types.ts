import { Timestamp } from 'firebase/firestore'

export type TProduct = {
  id: string
  description: string
  price: number
  barcode: string | null
  tax: number | null
  margin: number | null
  observations: string | null
  familyId: string | null
  supplierIds: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
