import type { TInvoiceItem, TProduct, TQuoteItem } from '@/models'

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
