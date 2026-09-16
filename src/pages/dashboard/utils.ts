import type {
  TInvoice,
  TPriceAdjustment,
  TProduct,
  TQuote,
  TSettings
} from '@/models'
import { evaluateMargin, getMarginTolerance, type TMarginStatus } from '@/utils'

export type TMarginAlert = {
  id: string
  description: string
  price: number
  cost: number
  targetMargin: number
  actualMargin: number
  marginGap: number
  status: TMarginStatus
}

export type TMarginAlerts = {
  below: TMarginAlert[]
  above: TMarginAlert[]
}

// Custo real só existe pra produtos que já passaram pelo relatório de
// reajustes de preços (resolvedCost, ver pages/price-adjustments/utils.ts) —
// não há como calcular margem atual sem ele, então o produto simplesmente
// não entra na lista.
export const getMarginAlerts = (
  products: TProduct[],
  priceAdjustments: TPriceAdjustment[],
  settings: TSettings | null
): TMarginAlerts => {
  const productById = new Map(products.map((p) => [p.id, p]))

  const below: TMarginAlert[] = []
  const above: TMarginAlert[] = []

  priceAdjustments.forEach((adjustment) => {
    const product = productById.get(adjustment.productId)
    if (!product || product.margin == null) return

    const price = product.price
    const cost = adjustment.resolvedCost
    if (!price || !cost) return

    const actualMargin = ((price - cost) / price) * 100
    const tolerance = getMarginTolerance(settings, product.departmentId)
    const { status, marginGap } = evaluateMargin(
      product.margin,
      actualMargin,
      tolerance
    )
    if (status === 'ok') return

    const alert: TMarginAlert = {
      id: product.id,
      description: product.description,
      price,
      cost,
      targetMargin: product.margin,
      actualMargin,
      marginGap,
      status
    }
    ;(status === 'below' ? below : above).push(alert)
  })

  below.sort((a, b) => b.marginGap - a.marginGap)
  above.sort((a, b) => a.marginGap - b.marginGap)

  return { below, above }
}

export type TDashboardStats = {
  productCount: number
  openQuoteCount: number
  pendingInvoiceCount: number
  belowMarginCount: number
  aboveMarginCount: number
}

export const getDashboardStats = (
  products: TProduct[],
  quotes: TQuote[],
  invoices: TInvoice[],
  marginAlerts: TMarginAlerts
): TDashboardStats => ({
  productCount: products.length,
  openQuoteCount: quotes.filter((quote) => quote.status === 'opened').length,
  pendingInvoiceCount: invoices.filter(
    (invoice) => invoice.verificationStatus === 'pending'
  ).length,
  belowMarginCount: marginAlerts.below.length,
  aboveMarginCount: marginAlerts.above.length
})
