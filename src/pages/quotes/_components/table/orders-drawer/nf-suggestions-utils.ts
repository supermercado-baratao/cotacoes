import type { TInvoice, TInvoiceItem } from '@/models/invoice-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TQuote, TQuoteItem } from '@/models/quote-model/types'
import { isLikelyMatch } from '@/utils/quote-item-match'
import { matchesSearch } from '@/utils/search'

import { isInvoiceInQuoteWindow } from '../../../utils'

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
    if (!isInvoiceInQuoteWindow(invoice, quote, nextQuoteDate)) continue

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

const matchesItemSearch = (search: string, item: TInvoiceItem): boolean =>
  matchesSearch(
    search,
    item.description,
    item.barcode,
    item.calculatedBarcode,
    item.packageBarcode,
    item.supplierProductCode,
    item.productId
  )

export const filterSuggestionsBySearch = (
  search: string,
  suggestions: TNfSuggestionsResult
): TNfSuggestionsResult => {
  const filterGroup = (list: TInvoiceSuggestion[]): TInvoiceSuggestion[] =>
    list
      .map((s) => ({
        ...s,
        unlinkedItems: s.unlinkedItems.filter((item) =>
          matchesItemSearch(search, item)
        )
      }))
      .filter((s) => s.unlinkedItems.length > 0)

  return {
    likely: filterGroup(suggestions.likely),
    other: filterGroup(suggestions.other)
  }
}
