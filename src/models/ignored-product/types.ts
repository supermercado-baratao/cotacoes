import { Timestamp } from 'firebase/firestore'

export type TIgnoredProduct = {
  id: string
  barcode: string | null
  description: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
