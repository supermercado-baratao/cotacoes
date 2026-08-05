import { type TIgnoredSupplier, type TSupplier } from '@/models'
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

export const filterIgnoredSuppliers = (
  search: string,
  ignoredSuppliers: TIgnoredSupplier[]
) =>
  ignoredSuppliers.filter((s) =>
    matchesSearch(search, s.name, s.cnpj, s.cnpj.replace(/\D/g, ''))
  )
