import type { TInvoice, TProduct, TQuote, TSettings } from '@/models'
import {
  evaluateMargin,
  getMarginTolerance,
  resolveProductCost,
  type TMarginStatus,
  type TProductCostMap
} from '@/utils'

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

// Avalia todo o catálogo (não só produtos que já passaram por reajuste de
// preços) — custo vem de resolveProductCost: média das notas de entrada
// recentes, com fallback pro custo do catálogo (custocomimposto).
export const getMarginAlerts = (
  products: TProduct[],
  recentCostMap: TProductCostMap,
  settings: TSettings | null
): TMarginAlerts => {
  const below: TMarginAlert[] = []
  const above: TMarginAlert[] = []

  products.forEach((product) => {
    if (product.margin == null) return

    const price = product.price
    const cost = resolveProductCost(product, recentCostMap)
    // !price (não `price == null`) é proposital: preço 0 tornaria a divisão
    // abaixo indefinida. Custo 0 é um valor legítimo (ex: item promocional) e
    // não deve ser tratado como "sem dado".
    if (!price || cost == null) return

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
