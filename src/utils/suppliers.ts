import type { TIgnoredSupplier } from '@/models/ignored-supplier-model/types'
import type { TSupplier } from '@/models/supplier-model/types'

import { normalizeCnpj } from './formatters'

export const findSupplierByCnpj = (
  cnpj: string,
  suppliers: TSupplier[]
): TSupplier | null =>
  suppliers.find((s) => normalizeCnpj(s.cnpj) === normalizeCnpj(cnpj)) ?? null

export const isSupplierCnpjIgnored = (
  cnpj: string,
  ignoredSuppliers: TIgnoredSupplier[]
): boolean =>
  ignoredSuppliers.some((s) => normalizeCnpj(s.cnpj) === normalizeCnpj(cnpj))
