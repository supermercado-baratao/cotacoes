import { type TSupplier } from '@/models'
import { matchesSearch } from '@/utils'

export const filterSuppliers = (search: string, suppliers: TSupplier[]) =>
  suppliers.filter((s) =>
    matchesSearch(
      search,
      s.legalName,
      s.tradeName,
      s.cnpj,
      s.cnpj.replace(/\D/g, '')
    )
  )
