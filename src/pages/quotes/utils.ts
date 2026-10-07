import dayjs from 'dayjs'

import type { TFamily } from '@/models/family-model/types'
import type { TInvoice, TInvoiceDateRange } from '@/models/invoice-model/types'
import type { TOrder } from '@/models/order-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TPriceRef, TQuote } from '@/models/quote-model/types'

export const getNextQuoteDate = (
  quotes: TQuote[],
  quote: TQuote
): string | null => {
  const sorted = quotes.toSorted((a, b) => a.date.localeCompare(b.date))
  const index = sorted.findIndex((q) => q.id === quote.id)
  return sorted[index + 1]?.date ?? null
}

export const isInvoiceInQuoteWindow = (
  invoice: TInvoice,
  quote: TQuote,
  nextQuoteDate: string | null
): boolean => {
  const invoiceDate = dayjs(invoice.emissionDate).format('YYYY-MM-DD')
  return (
    invoiceDate >= quote.date &&
    (nextQuoteDate === null || invoiceDate < nextQuoteDate)
  )
}

export const getQuoteInvoiceDateRange = (
  quote: TQuote,
  nextQuoteDate: string | null
): TInvoiceDateRange => ({
  startDate: quote.date,
  endDate: nextQuoteDate
    ? dayjs(nextQuoteDate).subtract(1, 'day').format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD')
})

export const getPendingInvoicesForQuote = (
  invoices: TInvoice[],
  quote: TQuote,
  nextQuoteDate: string | null
): TInvoice[] =>
  invoices.filter(
    (invoice) =>
      isInvoiceInQuoteWindow(invoice, quote, nextQuoteDate) &&
      invoice.verificationStatus === 'pending'
  )

export const getAvailableYears = (quotes: TQuote[]) => {
  const years = [
    ...new Set(quotes.map((quote) => dayjs(quote.date).year()))
  ].toSorted((a, b) => b - a)

  return quotes.length === 0 ? [new Date().getFullYear()] : years
}

export const getAvailableMonths = (quotes: TQuote[], selectedYear: number) => {
  const filteredQuotes = quotes.filter(
    (quote) => dayjs(quote.date).year() === selectedYear
  )

  const months = [
    ...new Set(filteredQuotes.map((quote) => dayjs(quote.date).month() + 1))
  ].toSorted((a, b) => b - a)

  return months.length === 0 ? [new Date().getMonth() + 1] : months
}

export const getAvailableDays = (
  quotes: TQuote[],
  selectedYear: number,
  selectedMonth: number
) => {
  const filteredQuotes = quotes.filter(
    (quote) =>
      dayjs(quote.date).year() === selectedYear &&
      dayjs(quote.date).month() + 1 === selectedMonth
  )

  const days = [
    ...new Set(filteredQuotes.map((quote) => dayjs(quote.date).date()))
  ].toSorted((a, b) => b - a)

  return days.length === 0 ? [new Date().getDate()] : days
}

export const getSelectedQuote = (
  quotes: TQuote[],
  selectedYear: number,
  selectedMonth: number,
  selectedDay: number
) => {
  const quote = quotes.find(
    (quote) =>
      dayjs(quote.date).year() === selectedYear &&
      dayjs(quote.date).month() + 1 === selectedMonth &&
      dayjs(quote.date).date() === selectedDay
  )

  return quote ?? null
}

export const getNumberOfSuppliers = (orders: TOrder[]) =>
  new Set(orders.map((order) => order.supplierId)).size

export type TQuoteRow = {
  id: string
  description: string
  orderCount: number
  salePrice: number | null
  priceRef: TPriceRef
  referenceDescription: string | null
  minPrice: number | null
  maxPrice: number | null
  supplierCount: number
}

export const getReferenceDescription = (
  priceRef: TPriceRef,
  products: TProduct[],
  families: TFamily[]
): string | null => {
  if (priceRef?.type === 'product') {
    return products.find((p) => p.id === priceRef.id)?.description ?? null
  }
  if (priceRef?.type === 'family') {
    return families.find((f) => f.id === priceRef.id)?.description ?? null
  }
  return null
}

export const getQuoteRows = (
  quote: TQuote,
  orders: TOrder[],
  products: TProduct[],
  families: TFamily[]
): TQuoteRow[] =>
  quote.items.map((item) => {
    const itemOrders = orders.filter((o) => o.quoteItemId === item.id)
    const prices = itemOrders.map((o) => o.price)

    return {
      id: item.id,
      description: item.description,
      orderCount: itemOrders.length,
      salePrice: item.salePrice,
      priceRef: item.priceRef,
      referenceDescription: getReferenceDescription(
        item.priceRef,
        products,
        families
      ),
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      supplierCount: getNumberOfSuppliers(itemOrders)
    }
  })
