import type { Timestamp } from 'firebase/firestore'

import type { TIgnoredProduct } from '@/models/ignored-product-model/types'
import type { TIgnoredSupplier } from '@/models/ignored-supplier-model/types'
import type { TInvoice } from '@/models/invoice-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TSettings } from '@/models/settings-model/types'
import {
  evaluateMargin,
  getMarginTolerance,
  type TMarginStatus
} from '@/utils/margin'
import { matchesSearch } from '@/utils/search'
import { isSupplierCnpjIgnored } from '@/utils/suppliers'

export const filterProducts = (search: string, products: TProduct[]) =>
  products.filter((p) =>
    matchesSearch(search, p.description, p.id, p.barcodes.join(' '))
  )

export type TProductRow = TProduct & { marginStatus: TMarginStatus | null }

export const attachProductMarginStatus = (
  products: TProduct[],
  settings: TSettings | null
): TProductRow[] => {
  return products.map((product) => {
    const cost = product.costWithTax
    const price = product.price

    if (!price || cost == null) {
      return { ...product, marginStatus: null }
    }

    const actualMargin = ((price - cost) / price) * 100
    const tolerance = getMarginTolerance(settings, product.departmentId)
    const { status } = evaluateMargin(actualMargin, tolerance)

    return { ...product, marginStatus: status }
  })
}

export const isProductIgnored = (
  productId: string,
  ignoredProducts: TIgnoredProduct[]
): boolean => ignoredProducts.some((ip) => ip.id === productId)

export type TUnmatchedProductItem = {
  key: string
  barcode: string | null
  packageBarcode: string | null
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
        packageBarcode: isNewer ? item.packageBarcode : existing.packageBarcode,
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

export const getUnmatchedProductIgnoreKey = (
  barcode: string | null,
  description: string
): string => barcode ?? description.trim().toUpperCase()

export const isUnmatchedItemIgnored = (
  item: TUnmatchedProductItem,
  ignoredProducts: TIgnoredProduct[]
): boolean =>
  ignoredProducts.some(
    (ip) =>
      ip.id === getUnmatchedProductIgnoreKey(item.barcode, item.description)
  )

export type TIgnoredProductRow = {
  id: string
  barcode: string | null
  description: string
  reason: string
  ignoredAt: Timestamp | null
  removable: boolean
}

export const buildIgnoredProductRows = (
  ignoredProducts: TIgnoredProduct[],
  invoices: TInvoice[],
  ignoredSuppliers: TIgnoredSupplier[]
): TIgnoredProductRow[] => {
  const manualRows: TIgnoredProductRow[] = ignoredProducts.map((ip) => ({
    id: ip.id,
    barcode: ip.barcode,
    description: ip.description,
    reason: 'Ignorado manualmente',
    ignoredAt: ip.createdAt,
    removable: true
  }))

  const manualKeys = new Set(ignoredProducts.map((ip) => ip.id))

  const supplierRows: TIgnoredProductRow[] = getUnmatchedProductItems(invoices)
    .filter((item) =>
      isSupplierCnpjIgnored(item.supplierCnpj, ignoredSuppliers)
    )
    .filter(
      (item) =>
        !manualKeys.has(
          getUnmatchedProductIgnoreKey(item.barcode, item.description)
        )
    )
    .map((item) => ({
      id: item.key,
      barcode: item.barcode,
      description: item.description,
      reason: `Fornecedor ignorado: ${(item.supplierName || item.supplierCnpj).toUpperCase()}`,
      ignoredAt: null,
      removable: false
    }))

  return [...manualRows, ...supplierRows]
}

export const filterIgnoredProducts = (
  search: string,
  rows: TIgnoredProductRow[]
): TIgnoredProductRow[] =>
  rows.filter((row) =>
    matchesSearch(search, row.description, row.barcode, row.reason)
  )
