export type TSupplier = {
  id: string
  legalName: string
  tradeName: string
  cnpj: string
  email: string | null
  phone: string | null
  sellerIds: string[]
  createdAt: number
  updatedAt: number
}
