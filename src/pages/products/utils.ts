import type { TInvoice, TProduct } from '@/models'
import { matchesSearch } from '@/utils'

export const filterProducts = (search: string, products: TProduct[]) =>
  products.filter((p) =>
    matchesSearch(search, p.description, p.barcodes.join(' '))
  )

export type TUnmatchedProductItem = {
  key: string
  barcode: string | null
  description: string
  unitPrice: number
  supplierName: string
  supplierCnpj: string
  occurrences: number
  lastInvoiceId: string
  lastInvoiceNumber: string
  lastEmissionDate: string
}

export const getUnmatchedProductItems = (
  invoices: TInvoice[]
): TUnmatchedProductItem[] => {
  const itemsByKey = new Map<string, TUnmatchedProductItem>()

  for (const invoice of invoices) {
    for (const item of invoice.items) {
      if (item.matchStatus !== 'unmatched_product') continue

      const barcode = item.barcode ?? item.calculatedBarcode ?? null
      const key = barcode ?? `${invoice.id}-${item.itemNumber}`
      const existing = itemsByKey.get(key)

      const isNewer =
        !existing || invoice.emissionDate > existing.lastEmissionDate

      itemsByKey.set(key, {
        key,
        barcode,
        description: isNewer ? item.description : existing.description,
        unitPrice: isNewer ? item.unitPrice : existing.unitPrice,
        supplierName: isNewer ? invoice.supplierName : existing.supplierName,
        supplierCnpj: isNewer ? invoice.supplierCnpj : existing.supplierCnpj,
        occurrences: (existing?.occurrences ?? 0) + 1,
        lastInvoiceId: isNewer ? invoice.id : existing.lastInvoiceId,
        lastInvoiceNumber: isNewer
          ? invoice.number
          : existing.lastInvoiceNumber,
        lastEmissionDate: isNewer
          ? invoice.emissionDate
          : existing.lastEmissionDate
      })
    }
  }

  return Array.from(itemsByKey.values()).sort((a, b) =>
    b.lastEmissionDate.localeCompare(a.lastEmissionDate)
  )
}

export const filterUnmatchedProductItems = (
  search: string,
  items: TUnmatchedProductItem[]
): TUnmatchedProductItem[] =>
  items.filter((i) =>
    matchesSearch(search, i.description, i.barcode, i.supplierName)
  )
