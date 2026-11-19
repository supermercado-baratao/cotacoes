import type { Timestamp } from 'firebase/firestore'

import { COST_DIVERGENCE_ATTENTION_PERCENT } from '@/constants/margin'
import type {
  TInvoice,
  TInvoiceDateRange,
  TInvoiceItem
} from '@/models/invoice/types'
import type { TPackingDefault } from '@/models/packing-default/types'
import type { TMarginCostSource, TProduct } from '@/models/product/types'
import type { TQuote } from '@/models/quote/types'
import type { TSettings } from '@/models/settings/types'
import type { TSupplier } from '@/models/supplier/types'
import {
  getCostDivergence,
  getEntryUnitCost,
  type TEntryCost,
  type TEntryUnitCost,
  type TLastPaidEntry
} from '@/utils/entry-cost'
import {
  evaluateMargin,
  getMarginTolerance,
  type TMarginStatus
} from '@/utils/margin'
import { findSupplierByCnpj } from '@/utils/suppliers'

export type TMarginCostOption =
  | { source: 'vr'; cost: number }
  | {
      source: 'entries'
      cost: number
      paidEntryCount: number
      paidQuantity: number
      bonusQuantity: number
    }
  | ({ source: 'lastEntry'; cost: number } & Omit<TLastPaidEntry, 'unitCost'>)

export type TMarginAlert = {
  id: string
  description: string
  price: number
  cost: number
  costSource: TMarginCostSource
  defaultCostSource: TMarginCostSource
  costOptions: TMarginCostOption[]
  vrCost: number | null
  entryCost: number | null
  costDivergence: number | null
  isCostDivergent: boolean
  hasBonus: boolean
  needsPackReview: boolean
  hasPackCorrection: boolean
  thresholdMargin: number
  actualMargin: number
  marginGap: number
  // 'ok' only when the chosen cost puts the margin within range: the row stays
  // in the table the default cost put it in, so the choice can be reverted.
  status: TMarginStatus
  updatedAt: Timestamp
  vrCreatedAt: string
  lastEntryDate: string | null
}

// Order = default fallback priority. The last invoice is never a fallback (it
// only exists when the invoice average does), only a choice. A manually
// corrected packing puts the invoice average ahead of the VR cost: the VR cost
// is usually wrong because of the same packing.
export const getMarginCostOptions = (
  vrCost: number | null,
  entryCost: TEntryCost | null
): TMarginCostOption[] => {
  const options: TMarginCostOption[] = []
  if (vrCost != null) options.push({ source: 'vr', cost: vrCost })
  if (entryCost?.cost != null) {
    const entriesOption: TMarginCostOption = {
      source: 'entries',
      cost: entryCost.cost,
      paidEntryCount: entryCost.paidEntryCount,
      paidQuantity: entryCost.paidQuantity,
      bonusQuantity: entryCost.bonusQuantity
    }
    if (entryCost.hasPackCorrection) options.unshift(entriesOption)
    else options.push(entriesOption)
  }
  if (entryCost?.lastPaidEntry) {
    const { unitCost, ...lastPaidEntry } = entryCost.lastPaidEntry
    options.push({ source: 'lastEntry', cost: unitCost, ...lastPaidEntry })
  }
  return options
}

export const buildLastEntryDateMap = (
  invoices: TInvoice[]
): Map<string, string> => {
  const map = new Map<string, string>()
  for (const invoice of invoices) {
    for (const item of invoice.items) {
      if (!item.productId) continue
      const current = map.get(item.productId)
      if (!current || invoice.emissionDate > current) {
        map.set(item.productId, invoice.emissionDate)
      }
    }
  }
  return map
}

export type TMarginAlerts = {
  below: TMarginAlert[]
  above: TMarginAlert[]
}

// The default cost is the VR cost with tax (custocomimposto), the closest to
// the real cost; the invoice cost is still computed to flag a divergence from
// it. The margin target is not per product: tolerance.below/.above are the
// floor/ceiling for the whole catalog.
export const getMarginAlerts = (
  products: TProduct[],
  settings: TSettings | null,
  lastEntryDateMap: Map<string, string>,
  entryCostMap: Map<string, TEntryCost>
): TMarginAlerts => {
  const below: TMarginAlert[] = []
  const above: TMarginAlert[] = []

  for (const product of products) {
    const price = product.price
    const entryCost = entryCostMap.get(product.id) ?? null
    const vrCost = product.costWithTax
    const costOptions = getMarginCostOptions(vrCost, entryCost)
    const defaultOption = costOptions[0]
    // !price (not `price == null`) on purpose: a price of 0 would make the
    // division undefined, while a cost of 0 is legitimate (e.g. a promotional
    // item).
    if (!price || !defaultOption) continue

    const selectedOption =
      costOptions.find(
        (option) => option.source === product.marginCostSource
      ) ?? defaultOption
    const tolerance = getMarginTolerance(settings, product.departmentId)
    const evaluate = (cost: number) => {
      const actualMargin = ((price - cost) / price) * 100
      return { actualMargin, ...evaluateMargin(actualMargin, tolerance) }
    }
    const { actualMargin, status, marginGap } = evaluate(selectedOption.cost)
    const { status: defaultStatus } = evaluate(defaultOption.cost)
    const listStatus = status === 'ok' ? defaultStatus : status
    if (listStatus === 'ok') continue

    const costDivergence = getCostDivergence(entryCost?.cost ?? null, vrCost)
    const alert: TMarginAlert = {
      id: product.id,
      description: product.description,
      price,
      cost: selectedOption.cost,
      costSource: selectedOption.source,
      defaultCostSource: defaultOption.source,
      costOptions,
      vrCost,
      entryCost: entryCost?.cost ?? null,
      costDivergence,
      isCostDivergent:
        costDivergence !== null &&
        Math.abs(costDivergence) > COST_DIVERGENCE_ATTENTION_PERCENT,
      hasBonus: entryCost?.hasBonus ?? false,
      needsPackReview: entryCost?.needsPackReview ?? false,
      hasPackCorrection: entryCost?.hasPackCorrection ?? false,
      thresholdMargin:
        listStatus === 'below' ? tolerance.below : tolerance.above,
      actualMargin,
      marginGap,
      status,
      updatedAt: product.updatedAt,
      vrCreatedAt: product.vrCreatedAt,
      lastEntryDate: lastEntryDateMap.get(product.id) ?? null
    }
    ;(listStatus === 'below' ? below : above).push(alert)
  }

  below.sort((a, b) => b.marginGap - a.marginGap)
  above.sort((a, b) => b.marginGap - a.marginGap)

  return { below, above }
}

// `emissionDate` is the full <dhEmi> (with time and offset): compare only the
// date, or an invoice issued on the last day would be left out
// ("2026-05-30T12:51..." > "2026-05-30").
const isEmissionDateInRange = (
  emissionDate: string,
  dateRange: TInvoiceDateRange
): boolean => {
  const date = emissionDate.slice(0, 10)
  return date >= dateRange.startDate && date <= dateRange.endDate
}

export const filterInvoicesByEmissionDate = (
  invoices: TInvoice[],
  dateRange: TInvoiceDateRange | null
): TInvoice[] =>
  dateRange
    ? invoices.filter((invoice) =>
        isEmissionDateInRange(invoice.emissionDate, dateRange)
      )
    : invoices

// Presence in an invoice within the period, not the product's latest entry
// overall, which can fall outside the period even when the product was received
// within it.
export const buildProductIdsWithEntryInRange = (
  invoices: TInvoice[],
  dateRange: TInvoiceDateRange
): Set<string> => {
  const productIds = new Set<string>()
  for (const invoice of invoices) {
    if (!isEmissionDateInRange(invoice.emissionDate, dateRange)) continue
    for (const item of invoice.items) {
      if (item.productId) productIds.add(item.productId)
    }
  }
  return productIds
}

export type TInvoiceEntry = {
  invoice: TInvoice
  item: TInvoiceItem
}

export const getInvoiceEntriesForProduct = (
  invoices: TInvoice[],
  productId: string,
  dateRange: TInvoiceDateRange | null
): TInvoiceEntry[] => {
  const entries: TInvoiceEntry[] = []
  for (const invoice of invoices) {
    if (dateRange && !isEmissionDateInRange(invoice.emissionDate, dateRange)) {
      continue
    }
    for (const item of invoice.items) {
      if (item.productId === productId) entries.push({ invoice, item })
    }
  }
  return entries.toSorted((a, b) =>
    b.invoice.emissionDate.localeCompare(a.invoice.emissionDate)
  )
}

export type TInvoiceEntryWithCost = TInvoiceEntry & {
  entryCost: TEntryUnitCost | null
}

export const addEntryUnitCosts = (
  entries: TInvoiceEntry[],
  product: TProduct | null,
  suppliers: TSupplier[],
  packingDefaults: TPackingDefault[]
): TInvoiceEntryWithCost[] =>
  entries.map((entry) => ({
    ...entry,
    entryCost: product
      ? getEntryUnitCost(
          entry.invoice,
          entry.item,
          product,
          findSupplierByCnpj(entry.invoice.supplierCnpj, suppliers)?.id ?? null,
          packingDefaults
        )
      : null
  }))

// `productIdsInPeriod === null` keeps everything, including products without
// any entry matched to an invoice, which would otherwise always disappear with
// the filter on.
export const filterMarginAlertsByEntryPeriod = (
  alerts: TMarginAlerts,
  productIdsInPeriod: Set<string> | null
): TMarginAlerts => {
  if (!productIdsInPeriod) return alerts
  const isInPeriod = (alert: TMarginAlert) => productIdsInPeriod.has(alert.id)

  return {
    below: alerts.below.filter(isInPeriod),
    above: alerts.above.filter(isInPeriod)
  }
}

export type TDashboardStats = {
  productCount: number
  openQuoteCount: number
  pendingInvoiceCount: number
  belowMarginCount: number
  aboveMarginCount: number
}

export const getDashboardStats = (
  products: TProduct[],
  quotes: TQuote[],
  invoices: TInvoice[],
  marginAlerts: TMarginAlerts
): TDashboardStats => ({
  productCount: products.length,
  openQuoteCount: quotes.filter((quote) => quote.status === 'opened').length,
  pendingInvoiceCount: invoices.filter(
    (invoice) => invoice.verificationStatus === 'pending'
  ).length,
  belowMarginCount: marginAlerts.below.filter((alert) => alert.status !== 'ok')
    .length,
  aboveMarginCount: marginAlerts.above.filter((alert) => alert.status !== 'ok')
    .length
})
