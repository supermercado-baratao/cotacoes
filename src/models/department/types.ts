import { Timestamp } from 'firebase/firestore'

export type TDepartment = {
  id: string
  description: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
