import type { TInvoice } from '@/models'
import { matchesSearch } from '@/utils'

export const filterInvoices = (
  search: string,
  invoices: TInvoice[]
): TInvoice[] =>
  invoices.filter((inv) => matchesSearch(search, inv.number, inv.supplierName))
