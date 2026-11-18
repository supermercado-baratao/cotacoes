import type { TInvoiceItem } from '@/models/invoice/types'
import type { TProduct } from '@/models/product/types'
import type { TQuoteItem } from '@/models/quote/types'

export const getFamilyReferencePrice = (
  products: TProduct[],
  familyId: string
): number | null => {
  const prices = products
    .filter((p) => p.familyId === familyId)
    .map((p) => p.price)
  if (prices.length === 0) return null

  const counts = new Map<number, number>()
  for (const price of prices) counts.set(price, (counts.get(price) ?? 0) + 1)

  let mode = prices[0]
  let maxCount = 0
  for (const [price, count] of counts) {
    const isMoreFrequent =
      count > maxCount || (count === maxCount && price < mode)
    if (!isMoreFrequent) continue
    mode = price
    maxCount = count
  }
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
