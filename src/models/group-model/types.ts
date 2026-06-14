import { Timestamp } from 'firebase/firestore'

export type TGroup = {
  id: string
  description: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
