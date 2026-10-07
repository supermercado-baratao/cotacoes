import { type TIgnoredSupplier } from '@/models/ignored-supplier-model/types'
import { type TSupplier } from '@/models/supplier-model/types'
import { matchesSearch } from '@/utils/search'

export const filterSuppliers = (search: string, suppliers: TSupplier[]) =>
  suppliers.filter((s) =>
    matchesSearch(
      search,
      s.legalName,
      s.tradeName,
      s.cnpj,
      s.cnpj.replaceAll(/\D/g, '')
    )
  )

export const filterIgnoredSuppliers = (
  search: string,
  ignoredSuppliers: TIgnoredSupplier[]
) =>
  ignoredSuppliers.filter((s) =>
    matchesSearch(search, s.name, s.cnpj, s.cnpj.replaceAll(/\D/g, ''))
  )
