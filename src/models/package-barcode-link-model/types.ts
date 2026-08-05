import { Timestamp } from 'firebase/firestore'

export type TPackageBarcodeLink = {
  id: string
  packageBarcode: string
  productId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
