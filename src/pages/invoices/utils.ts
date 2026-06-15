import type { TInvoice } from '@/models'

export const filterInvoices = (
  search: string,
  invoices: TInvoice[]
): TInvoice[] => {
  if (!search) return invoices
  const lower = search.toLowerCase()
  return invoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(lower) ||
      inv.supplierName.toLowerCase().includes(lower)
  )
}
