import dayjs from 'dayjs'

import type {
  TInvoice,
  TInvoiceItem,
  TProduct,
  TQuote,
  TQuoteItem
} from '@/models'
import { isLikelyMatch } from '@/utils'

export type TInvoiceSuggestion = {
  invoice: TInvoice
  unlinkedItems: TInvoiceItem[]
}

export type TNfSuggestionsResult = {
  likely: TInvoiceSuggestion[]
  other: TInvoiceSuggestion[]
}

export const getInvoiceSuggestions = (
  quoteItem: TQuoteItem,
  invoices: TInvoice[],
  products: TProduct[],
  quote: TQuote,
  nextQuoteDate: string | null
): TNfSuggestionsResult => {
  const productMap = new Map(products.map((p) => [p.id, p]))
  const likely: TInvoiceSuggestion[] = []
  const other: TInvoiceSuggestion[] = []

  for (const invoice of invoices) {
    const invoiceDate = dayjs(invoice.emissionDate).format('YYYY-MM-DD')
    const inRange =
      invoiceDate >= quote.date &&
      (nextQuoteDate === null || invoiceDate < nextQuoteDate)
    if (!inRange) continue

    const unlinkedItems = invoice.items.filter((item) => item.orderId === null)
    if (!unlinkedItems.length) continue

    const hasLikelyItem = unlinkedItems.some((item) =>
      isLikelyMatch(item, quoteItem, productMap)
    )

    const suggestion: TInvoiceSuggestion = { invoice, unlinkedItems }
    if (hasLikelyItem) {
      likely.push(suggestion)
    } else {
      other.push(suggestion)
    }
  }

  return { likely, other }
}
