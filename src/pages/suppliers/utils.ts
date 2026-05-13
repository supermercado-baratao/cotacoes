import { type TSupplier } from '@/models'

export const filterSuppliers = (search: string, suppliers: TSupplier[]) => {
  const lower = search.toLowerCase()
  return suppliers.filter(
    (s) =>
      s.legalName.toLowerCase().includes(lower) ||
      s.tradeName.toLowerCase().includes(lower) ||
      s.cnpj.includes(lower.replace(/\D/g, ''))
  )
}
