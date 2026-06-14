import { Timestamp } from 'firebase/firestore'

export type TSupplier = {
  id: string
  vrId: string
  legalName: string
  tradeName: string
  cnpj: string
  email: string | null
  phone: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
