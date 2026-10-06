import type { QueryClient, QueryKey } from '@tanstack/react-query'
import dayjs from 'dayjs'

import type { TInvoice, TInvoiceDateRange } from '@/models/invoice-model/types'

import {
  addManyToArrayCache,
  removeFromArrayCache,
  upsertInArrayCache
} from './query-cache'

const isWithinRange = (emissionDate: string, range: TInvoiceDateRange) =>
  emissionDate >= range.startDate &&
  emissionDate < dayjs(range.endDate).add(1, 'day').format('YYYY-MM-DD')

export const invoicesKey = (range: TInvoiceDateRange): QueryKey => [
  'invoices',
  range.startDate,
  range.endDate
]

export const upsertInvoiceInCache = (
  queryClient: QueryClient,
  invoice: TInvoice,
  range: TInvoiceDateRange
) => {
  if (!isWithinRange(invoice.emissionDate, range)) return
  upsertInArrayCache(queryClient, invoicesKey(range), invoice)
}

export const addInvoicesToCache = (
  queryClient: QueryClient,
  invoices: TInvoice[],
  range: TInvoiceDateRange
) => {
  const withinRange = invoices.filter((invoice) =>
    isWithinRange(invoice.emissionDate, range)
  )
  if (!withinRange.length) return
  addManyToArrayCache(queryClient, invoicesKey(range), withinRange)
}

export const removeInvoiceFromCache = (
  queryClient: QueryClient,
  id: string,
  range: TInvoiceDateRange
) => removeFromArrayCache(queryClient, invoicesKey(range), id)
