import { Timestamp } from 'firebase/firestore'

export type TSupplier = {
  id: string
  legalName: string
  tradeName: string
  cnpj: string
  email: string | null
  phone: string | null
  vrCreatedAt: string | null
  observations: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
