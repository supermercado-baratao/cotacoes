import type { TInvoice, TPriceAdjustment, TProduct, TQuote } from '@/models'

export type TMarginAlert = {
  id: string
  description: string
  price: number
  cost: number
  targetMargin: number
  actualMargin: number
  marginGap: number
}

// Custo real só existe pra produtos que já passaram pelo relatório de
// reajustes de preços (resolvedCost, ver pages/price-adjustments/utils.ts) —
// não há como calcular margem atual sem ele, então o produto simplesmente
// não entra na lista.
export const getMarginAlerts = (
  products: TProduct[],
  priceAdjustments: TPriceAdjustment[]
): TMarginAlert[] => {
  const productById = new Map(products.map((p) => [p.id, p]))

  const alerts = priceAdjustments.reduce<TMarginAlert[]>((acc, adjustment) => {
    const product = productById.get(adjustment.productId)
    if (!product || product.margin == null) return acc

    const price = product.price
    const cost = adjustment.resolvedCost
    if (!price || !cost) return acc

    const actualMargin = ((price - cost) / price) * 100
    const marginGap = product.margin - actualMargin
    if (marginGap <= 0) return acc

    acc.push({
      id: product.id,
      description: product.description,
      price,
      cost,
      targetMargin: product.margin,
      actualMargin,
      marginGap
    })
    return acc
  }, [])

  return alerts.sort((a, b) => b.marginGap - a.marginGap)
}

export type TDashboardStats = {
  productCount: number
  openQuoteCount: number
  pendingInvoiceCount: number
  belowMarginCount: number
}

export const getDashboardStats = (
  products: TProduct[],
  quotes: TQuote[],
  invoices: TInvoice[],
  marginAlerts: TMarginAlert[]
): TDashboardStats => ({
  productCount: products.length,
  openQuoteCount: quotes.filter((quote) => quote.status === 'opened').length,
  pendingInvoiceCount: invoices.filter(
    (invoice) => invoice.verificationStatus === 'pending'
  ).length,
  belowMarginCount: marginAlerts.length
})
