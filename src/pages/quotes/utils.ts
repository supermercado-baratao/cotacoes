import dayjs from 'dayjs'

import type { TOrder, TProduct, TQuote, TSupplier } from '@/models'

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

export const getNumberOfSuppliers = (orders: TOrder[]) => {
  const supplierIds = orders.map((order) => order.supplierId)
  return Array.from(new Set(supplierIds)).length
}

export const getQuoteProducts = (
  productIds: string[],
  products: TProduct[]
) => {
  return products.filter((product) => productIds.includes(product.id))
}

export type TQuoteRow = {
  id: string
  description: string
  productPrice: number | null
  orderId: string | null
  orderPrice: number | null
  quantity: number | null
  packing: string | null
  supplierName: string | null
  observations: string | null
}

export const getQuoteRows = (
  quoteProducts: TProduct[],
  ordersByQuoteId: TOrder[],
  suppliers: TSupplier[]
): TQuoteRow[] =>
  quoteProducts.map((product) => {
    const order =
      ordersByQuoteId.find((o) => o.productId === product.id) ?? null
    const supplier = order
      ? (suppliers.find((s) => s.id === order.supplierId) ?? null)
      : null

    return {
      id: product.id,
      description: product.description,
      productPrice: product.price,
      orderId: order?.id ?? null,
      orderPrice: order?.price ?? null,
      quantity: order?.quantity ?? null,
      packing: order?.packing ?? null,
      supplierName: supplier?.tradeName ?? null,
      observations: order?.observations ?? product.observations
    }
  })
