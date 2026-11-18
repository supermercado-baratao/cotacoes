import { Timestamp } from 'firebase/firestore'

export type TSeller = {
  id: string
  name: string
  phone: string | null
  supplierIds: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
