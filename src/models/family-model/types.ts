import { Timestamp } from 'firebase/firestore'

export type TFamily = {
  id: string
  vrId: string
  description: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
