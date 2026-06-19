import { Timestamp } from 'firebase/firestore'

export type TFamily = {
  id: string
  description: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
