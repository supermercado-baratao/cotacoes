import { Timestamp } from 'firebase/firestore'

export type TSettings = {
  id: string
  pdfDepartmentOrder: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
