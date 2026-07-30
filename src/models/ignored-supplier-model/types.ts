import { Timestamp } from 'firebase/firestore'

export type TIgnoredSupplier = {
  id: string
  cnpj: string
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
