import type { TInvoiceItem, TProduct, TQuoteItem } from '@/models'

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

export const findBestQuoteItemMatch = (
  item: TInvoiceItem,
  quoteItems: TQuoteItem[],
  productMap: Map<string, TProduct>
): TQuoteItem | null =>
  quoteItems.find((quoteItem) => isLikelyMatch(item, quoteItem, productMap)) ??
  null
