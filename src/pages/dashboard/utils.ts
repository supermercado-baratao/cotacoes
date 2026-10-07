import type { Timestamp } from 'firebase/firestore'

import { COST_DIVERGENCE_ATTENTION_PERCENT } from '@/constants/margin'
import type {
  TInvoice,
  TInvoiceDateRange,
  TInvoiceItem
} from '@/models/invoice-model/types'
import type { TMarginCostSource, TProduct } from '@/models/product-model/types'
import type { TQuote } from '@/models/quote-model/types'
import type { TSettings } from '@/models/settings-model/types'
import type { TSupplier } from '@/models/supplier-model/types'
import {
  getCostDivergence,
  getEntryUnitCost,
  type TEntryCost,
  type TEntryUnitCost,
  type TLastPaidEntry
} from '@/utils/entry-cost'
import {
  evaluateMargin,
  getMarginTolerance,
  type TMarginStatus
} from '@/utils/margin'
import { findSupplierByCnpj } from '@/utils/suppliers'

// Uma fonte de custo disponível pro produto — alimenta o select da coluna
// Custo, com o que for preciso pra identificar de onde o valor vem.
export type TMarginCostOption =
  | { source: 'vr'; cost: number }
  | {
      source: 'entries'
      cost: number
      paidEntryCount: number
      paidQuantity: number
      bonusQuantity: number
    }
  | ({ source: 'lastEntry'; cost: number } & Omit<TLastPaidEntry, 'unitCost'>)

export type TMarginAlert = {
  id: string
  description: string
  price: number
  // Custo usado na margem: o escolhido no select da coluna Custo ou, sem
  // escolha, o padrão (custo com imposto do VR quando houver, senão o médio
  // das notas de entrada do período).
  cost: number
  costSource: TMarginCostSource
  defaultCostSource: TMarginCostSource
  costOptions: TMarginCostOption[]
  vrCost: number | null
  entryCost: number | null
  // Divergência (%) do custo das notas em relação ao custo do VR.
  costDivergence: number | null
  isCostDivergent: boolean
  hasBonus: boolean
  needsPackReview: boolean
  thresholdMargin: number
  actualMargin: number
  marginGap: number
  // 'ok' só quando o custo escolhido no select põe a margem dentro da faixa —
  // a linha continua na tabela em que o custo padrão a colocou, pra poder
  // voltar a escolha.
  status: TMarginStatus
  updatedAt: Timestamp
  vrCreatedAt: string
  lastEntryDate: string | null
}

// Ordem = prioridade do fallback padrão. A última NF não entra no fallback
// (só existe quando o médio das notas também existe), só como escolha.
export const getMarginCostOptions = (
  vrCost: number | null,
  entryCost: TEntryCost | null
): TMarginCostOption[] => {
  const options: TMarginCostOption[] = []
  if (vrCost != null) options.push({ source: 'vr', cost: vrCost })
  if (entryCost?.cost != null) {
    options.push({
      source: 'entries',
      cost: entryCost.cost,
      paidEntryCount: entryCost.paidEntryCount,
      paidQuantity: entryCost.paidQuantity,
      bonusQuantity: entryCost.bonusQuantity
    })
  }
  if (entryCost?.lastPaidEntry) {
    const { unitCost, ...lastPaidEntry } = entryCost.lastPaidEntry
    options.push({ source: 'lastEntry', cost: unitCost, ...lastPaidEntry })
  }
  return options
}

// Última data de emissão entre as notas com item vinculado ao produto — base
// pro filtro de período por "última entrada" no Dashboard.
export const buildLastEntryDateMap = (
  invoices: TInvoice[]
): Map<string, string> => {
  const map = new Map<string, string>()
  for (const invoice of invoices) {
    for (const item of invoice.items) {
      if (!item.productId) continue
      const current = map.get(item.productId)
      if (!current || invoice.emissionDate > current) {
        map.set(item.productId, invoice.emissionDate)
      }
    }
  }
  return map
}

export type TMarginAlerts = {
  below: TMarginAlert[]
  above: TMarginAlert[]
}

// Avalia todo o catálogo (não só produtos que já passaram por reajuste de
// preços). Custo padrão: custo com imposto cadastrado no VR
// (custocomimposto), o mais próximo do real, com fallback pro médio das notas
// de entrada do período (ver buildEntryCostMap — quantidade convertida pela
// unidade tributável da nota (embalagem diferente de UN) ou pela embalagem do
// VR, e bonificação entrando só na quantidade) quando o produto não tem custo
// no VR. `product.marginCostSource` troca a fonte pela escolhida (e salva) no
// select da coluna Custo (ignorada se a fonte não estiver disponível). O custo das
// notas segue calculado pra sinalizar divergência com o VR.
// O alvo de margem não é por produto: `tolerance.below`/`.above`
// (Configurações, global ou por departamento) são o piso/teto aplicados a
// todo o catálogo.
export const getMarginAlerts = (
  products: TProduct[],
  settings: TSettings | null,
  lastEntryDateMap: Map<string, string>,
  entryCostMap: Map<string, TEntryCost>
): TMarginAlerts => {
  const below: TMarginAlert[] = []
  const above: TMarginAlert[] = []

  for (const product of products) {
    const price = product.price
    const entryCost = entryCostMap.get(product.id) ?? null
    const vrCost = product.costWithTax
    const costOptions = getMarginCostOptions(vrCost, entryCost)
    const defaultOption = costOptions[0]
    // !price (não `price == null`) é proposital: preço 0 tornaria a divisão
    // abaixo indefinida. Custo 0 é um valor legítimo (ex: item promocional) e
    // não deve ser tratado como "sem dado".
    if (!price || !defaultOption) continue

    const selectedOption =
      costOptions.find(
        (option) => option.source === product.marginCostSource
      ) ?? defaultOption
    const tolerance = getMarginTolerance(settings, product.departmentId)
    const evaluate = (cost: number) => {
      const actualMargin = ((price - cost) / price) * 100
      return { actualMargin, ...evaluateMargin(actualMargin, tolerance) }
    }
    const { actualMargin, status, marginGap } = evaluate(selectedOption.cost)
    const { status: defaultStatus } = evaluate(defaultOption.cost)
    const listStatus = status === 'ok' ? defaultStatus : status
    if (listStatus === 'ok') continue

    const costDivergence = getCostDivergence(entryCost?.cost ?? null, vrCost)
    const alert: TMarginAlert = {
      id: product.id,
      description: product.description,
      price,
      cost: selectedOption.cost,
      costSource: selectedOption.source,
      defaultCostSource: defaultOption.source,
      costOptions,
      vrCost,
      entryCost: entryCost?.cost ?? null,
      costDivergence,
      isCostDivergent:
        costDivergence !== null &&
        Math.abs(costDivergence) > COST_DIVERGENCE_ATTENTION_PERCENT,
      hasBonus: entryCost?.hasBonus ?? false,
      needsPackReview: entryCost?.needsPackReview ?? false,
      thresholdMargin:
        listStatus === 'below' ? tolerance.below : tolerance.above,
      actualMargin,
      marginGap,
      status,
      updatedAt: product.updatedAt,
      vrCreatedAt: product.vrCreatedAt,
      lastEntryDate: lastEntryDateMap.get(product.id) ?? null
    }
    ;(listStatus === 'below' ? below : above).push(alert)
  }

  below.sort((a, b) => b.marginGap - a.marginGap)
  above.sort((a, b) => b.marginGap - a.marginGap)

  return { below, above }
}

// `emissionDate` é o <dhEmi> completo (com hora e fuso) — compara só a data,
// senão uma nota emitida no próprio dia final ficaria de fora
// ("2026-05-30T12:51..." > "2026-05-30").
const isEmissionDateInRange = (
  emissionDate: string,
  dateRange: TInvoiceDateRange
): boolean => {
  const date = emissionDate.slice(0, 10)
  return date >= dateRange.startDate && date <= dateRange.endDate
}

// `dateRange === null` mantém todas as notas (filtro de período desligado).
export const filterInvoicesByEmissionDate = (
  invoices: TInvoice[],
  dateRange: TInvoiceDateRange | null
): TInvoice[] =>
  dateRange
    ? invoices.filter((invoice) =>
        isEmissionDateInRange(invoice.emissionDate, dateRange)
      )
    : invoices

// Produtos com item vinculado em alguma nota emitida dentro do intervalo —
// base pro filtro de período: presença numa nota do período, não a última
// entrada global do produto (que pode cair fora do período mesmo que o
// produto tenha sido recebido dentro dele).
export const buildProductIdsWithEntryInRange = (
  invoices: TInvoice[],
  dateRange: TInvoiceDateRange
): Set<string> => {
  const productIds = new Set<string>()
  for (const invoice of invoices) {
    if (!isEmissionDateInRange(invoice.emissionDate, dateRange)) continue
    for (const item of invoice.items) {
      if (item.productId) productIds.add(item.productId)
    }
  }
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
  for (const invoice of invoices) {
    if (dateRange && !isEmissionDateInRange(invoice.emissionDate, dateRange)) {
      continue
    }
    for (const item of invoice.items) {
      if (item.productId === productId) entries.push({ invoice, item })
    }
  }
  return entries.toSorted((a, b) =>
    b.invoice.emissionDate.localeCompare(a.invoice.emissionDate)
  )
}

export type TInvoiceEntryWithCost = TInvoiceEntry & {
  entryCost: TEntryUnitCost | null
}

// Embalagem, bonificação e custo por unidade de cada entrada — mesma conta
// usada no custo médio do alerta, pra o drawer mostrar de onde ele veio.
export const addEntryUnitCosts = (
  entries: TInvoiceEntry[],
  product: TProduct | null,
  suppliers: TSupplier[]
): TInvoiceEntryWithCost[] =>
  entries.map((entry) => ({
    ...entry,
    entryCost: product
      ? getEntryUnitCost(
          entry.invoice,
          entry.item,
          product,
          findSupplierByCnpj(entry.invoice.supplierCnpj, suppliers)?.id ?? null
        )
      : null
  }))

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
  // Linhas que o custo escolhido pôs dentro da margem ficam na tabela, mas não
  // contam como alerta.
  belowMarginCount: marginAlerts.below.filter((alert) => alert.status !== 'ok')
    .length,
  aboveMarginCount: marginAlerts.above.filter((alert) => alert.status !== 'ok')
    .length
})
