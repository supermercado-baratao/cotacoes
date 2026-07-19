import dayjs from 'dayjs'

import type {
  TFamily,
  TOrder,
  TPriceRef,
  TProduct,
  TQuote,
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

export const getFamilyReferencePrice = (
  products: TProduct[],
  familyId: string
): number | null => {
  const prices = products
    .filter((p) => p.familyId === familyId)
    .map((p) => p.price)
  if (!prices.length) return null

  const counts = new Map<number, number>()
  prices.forEach((price) => counts.set(price, (counts.get(price) ?? 0) + 1))

  let mode = prices[0]
  let maxCount = 0
  counts.forEach((count, price) => {
    if (count > maxCount || (count === maxCount && price < mode)) {
      mode = price
      maxCount = count
    }
  })
  return mode
}

export type TQuoteRow = {
  id: string
  description: string
  orderCount: number
  salePrice: number | null
  priceRef: TPriceRef
  referenceDescription: string | null
  orderPrices: number[]
  supplierNames: string[]
}

const getReferenceDescription = (
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
  suppliers: TSupplier[],
  products: TProduct[],
  families: TFamily[]
): TQuoteRow[] =>
  quote.items.map((item) => {
    const itemOrders = orders.filter((o) => o.quoteItemId === item.id)
    const sorted = [...itemOrders].sort((a, b) => a.price - b.price)
    const seen = new Set<number>()
    const orderPrices: number[] = []
    const supplierNames: string[] = []
    for (const order of sorted) {
      if (seen.has(order.price)) continue
      seen.add(order.price)
      orderPrices.push(order.price)
      const supplier = suppliers.find((s) => s.id === order.supplierId)
      supplierNames.push(supplier?.tradeName ?? '')
    }

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
      orderPrices,
      supplierNames
    }
  })
