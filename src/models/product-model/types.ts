import { Timestamp } from 'firebase/firestore'

export type TProduct = {
  id: string
  description: string
  price: number
  barcodes: string[]
  packTypes: string[]
  tax: number | null
  margin: number | null
  observations: string | null
  familyId: string | null
  departmentId: string | null
  department: string
  section: string
  group: string
  stock: number
  vrCreatedAt: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
