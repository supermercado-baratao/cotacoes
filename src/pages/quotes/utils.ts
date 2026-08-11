import dayjs from 'dayjs'

import type {
  TFamily,
  TInvoice,
  TInvoiceDateRange,
  TOrder,
  TPriceRef,
  TProduct,
  TQuote
} from '@/models'

export const getNextQuoteDate = (
  quotes: TQuote[],
  quote: TQuote
): string | null => {
  const sorted = [...quotes].sort((a, b) => a.date.localeCompare(b.date))
  const idx = sorted.findIndex((q) => q.id === quote.id)
  return sorted[idx + 1]?.date ?? null
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
  const years = Array.from(
    new Set(quotes.map((quote) => dayjs(quote.date).year()))
  ).sort((a, b) => b - a)

  if (!quotes.length) {
    return [new Date().getFullYear()]
  }

  return years
}

export const getAvailableMonths = (quotes: TQuote[], selectedYear: number) => {
  const filteredQuotes = quotes.filter(
    (quote) => dayjs(quote.date).year() === selectedYear
  )

  const months = Array.from(
    new Set(filteredQuotes.map((quote) => dayjs(quote.date).month() + 1))
  ).sort((a, b) => b - a)

  if (!months.length) {
    return [new Date().getMonth() + 1]
  }

  return months
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

  const days = Array.from(
    new Set(filteredQuotes.map((quote) => dayjs(quote.date).date()))
  ).sort((a, b) => b - a)

  if (!days.length) {
    return [new Date().getDate()]
  }

  return days
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
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      supplierCount: getNumberOfSuppliers(itemOrders)
    }
  })
