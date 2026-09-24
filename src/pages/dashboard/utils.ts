import type { Timestamp } from 'firebase/firestore'

import type {
  TInvoice,
  TInvoiceDateRange,
  TInvoiceItem,
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
  thresholdMargin: number
  actualMargin: number
  marginGap: number
  status: TMarginStatus
  updatedAt: Timestamp
  vrCreatedAt: string
  lastEntryDate: string | null
}

// Última data de emissão entre as notas com item vinculado ao produto — base
// pro filtro de período por "última entrada" no Dashboard.
export const buildLastEntryDateMap = (
  invoices: TInvoice[]
): Map<string, string> => {
  const map = new Map<string, string>()
  invoices.forEach((invoice) => {
    invoice.items.forEach((item) => {
      if (!item.productId) return
      const current = map.get(item.productId)
      if (!current || invoice.emissionDate > current) {
        map.set(item.productId, invoice.emissionDate)
      }
    })
  })
  return map
}

export type TMarginAlerts = {
  below: TMarginAlert[]
  above: TMarginAlert[]
}

// Avalia todo o catálogo (não só produtos que já passaram por reajuste de
// preços) — custo é sempre o custo com imposto cadastrado no produto
// (custocomimposto), sem olhar pra notas fiscais (quantidade por nota não é
// confiável pra sustentar uma média). O alvo de margem não é mais por
// produto: `tolerance.below`/`.above` (Configurações, global ou por
// departamento) são o piso/teto aplicados a todo o catálogo.
export const getMarginAlerts = (
  products: TProduct[],
  settings: TSettings | null,
  lastEntryDateMap: Map<string, string>
): TMarginAlerts => {
  const below: TMarginAlert[] = []
  const above: TMarginAlert[] = []

  products.forEach((product) => {
    const price = product.price
    const cost = product.costWithTax
    // !price (não `price == null`) é proposital: preço 0 tornaria a divisão
    // abaixo indefinida. Custo 0 é um valor legítimo (ex: item promocional) e
    // não deve ser tratado como "sem dado".
    if (!price || cost == null) return

    const actualMargin = ((price - cost) / price) * 100
    const tolerance = getMarginTolerance(settings, product.departmentId)
    const { status, marginGap } = evaluateMargin(actualMargin, tolerance)
    if (status === 'ok') return

    const alert: TMarginAlert = {
      id: product.id,
      description: product.description,
      price,
      cost,
      thresholdMargin: status === 'below' ? tolerance.below : tolerance.above,
      actualMargin,
      marginGap,
      status,
      updatedAt: product.updatedAt,
      vrCreatedAt: product.vrCreatedAt,
      lastEntryDate: lastEntryDateMap.get(product.id) ?? null
    }
    ;(status === 'below' ? below : above).push(alert)
  })

  below.sort((a, b) => b.marginGap - a.marginGap)
  above.sort((a, b) => b.marginGap - a.marginGap)

  return { below, above }
}

const isEmissionDateInRange = (
  emissionDate: string,
  dateRange: TInvoiceDateRange
): boolean =>
  emissionDate >= dateRange.startDate && emissionDate <= dateRange.endDate

// Produtos com item vinculado em alguma nota emitida dentro do intervalo —
// base pro filtro de período: presença numa nota do período, não a última
// entrada global do produto (que pode cair fora do período mesmo que o
// produto tenha sido recebido dentro dele).
export const buildProductIdsWithEntryInRange = (
  invoices: TInvoice[],
  dateRange: TInvoiceDateRange
): Set<string> => {
  const productIds = new Set<string>()
  invoices.forEach((invoice) => {
    if (!isEmissionDateInRange(invoice.emissionDate, dateRange)) return
    invoice.items.forEach((item) => {
      if (item.productId) productIds.add(item.productId)
    })
  })
  return productIds
}

export type TInvoiceEntry = {
  invoice: TInvoice
  item: TInvoiceItem
}

// Notas (e o item correspondente) em que um produto teve entrada — base do
// drawer "Ver notas" de um alerta de margem. `dateRange === null` traz todas
// as notas carregadas com o produto, sem restringir por período (reflete o
// filtro de período desligado ou um período inválido).
export const getInvoiceEntriesForProduct = (
  invoices: TInvoice[],
  productId: string,
  dateRange: TInvoiceDateRange | null
): TInvoiceEntry[] => {
  const entries: TInvoiceEntry[] = []
  invoices.forEach((invoice) => {
    if (dateRange && !isEmissionDateInRange(invoice.emissionDate, dateRange)) {
      return
    }
    invoice.items.forEach((item) => {
      if (item.productId === productId) entries.push({ invoice, item })
    })
  })
  return entries.sort((a, b) =>
    b.invoice.emissionDate.localeCompare(a.invoice.emissionDate)
  )
}

// Filtro de período: mantém só os alertas cujo produto apareceu em alguma
// nota emitida dentro do intervalo. `productIdsInPeriod === null` desativa o
// filtro (período inválido ou desligado pelo usuário na tela) e mantém tudo
// — inclusive produtos sem nenhuma entrada casada a uma nota, que senão
// sempre sumiriam com o filtro ligado.
export const filterMarginAlertsByEntryPeriod = (
  alerts: TMarginAlerts,
  productIdsInPeriod: Set<string> | null
): TMarginAlerts => {
  if (!productIdsInPeriod) return alerts
  const isInPeriod = (alert: TMarginAlert) => productIdsInPeriod.has(alert.id)

  return {
    below: alerts.below.filter(isInPeriod),
    above: alerts.above.filter(isInPeriod)
  }
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
