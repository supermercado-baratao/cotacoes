import dayjs from 'dayjs'

import type {
  TInvoice,
  TInvoiceItem,
  TProduct,
  TQuote,
  TQuoteItem
} from '@/models'

export type TInvoiceSuggestion = {
  invoice: TInvoice
  unlinkedItems: TInvoiceItem[]
}

export type TNfSuggestionsResult = {
  likely: TInvoiceSuggestion[]
  other: TInvoiceSuggestion[]
}

export const isLikelyMatch = (
  item: TInvoiceItem,
  quoteItem: TQuoteItem,
  productMap: Map<string, TProduct>
): boolean => {
  if (!item.productId) return false
  const product = productMap.get(item.productId)

  if (quoteItem.priceRef?.type === 'product') {
    if (item.productId === quoteItem.priceRef.id) return true
    const refProduct = productMap.get(quoteItem.priceRef.id)
    return (
      !!product?.familyId &&
      !!refProduct?.familyId &&
      product.familyId === refProduct.familyId
    )
  }

  if (quoteItem.priceRef?.type === 'family') {
    return product?.familyId === quoteItem.priceRef.id
  }

  return false
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
