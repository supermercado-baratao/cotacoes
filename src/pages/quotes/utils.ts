import dayjs from 'dayjs'

import type {
  TFamily,
  TOrder,
  TProduct,
  TQuote,
  TQuoteItemType,
  TSupplier
} from '@/models'

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
  type: TQuoteItemType
  description: string
  orderCount: number
  bestOrderPrice: number | null
  bestSupplierName: string | null
}

const resolveItemDescription = (
  id: string,
  type: TQuoteItemType,
  products: TProduct[],
  families: TFamily[]
): string => {
  if (type === 'product')
    return products.find((p) => p.id === id)?.description ?? id
  return families.find((f) => f.id === id)?.description ?? id
}

export const getQuoteRows = (
  quote: TQuote,
  products: TProduct[],
  families: TFamily[],
  orders: TOrder[],
  suppliers: TSupplier[]
): TQuoteRow[] =>
  quote.items.map((item) => {
    const itemOrders = orders.filter((o) => o.quoteItemId === item.id)
    const bestOrder = itemOrders.length
      ? itemOrders.reduce((best, o) => (o.price < best.price ? o : best))
      : null
    const bestSupplier = bestOrder
      ? (suppliers.find((s) => s.id === bestOrder.supplierId) ?? null)
      : null

    return {
      id: item.id,
      type: item.type,
      description: resolveItemDescription(
        item.id,
        item.type,
        products,
        families
      ),
      orderCount: itemOrders.length,
      bestOrderPrice: bestOrder?.price ?? null,
      bestSupplierName: bestSupplier?.tradeName ?? null
    }
  })
