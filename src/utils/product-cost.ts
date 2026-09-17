import type { TInvoice, TProduct } from '@/models'

export type TProductCostMap = Map<string, number>

// Agrupa por produto uma vez só (custo médio ponderado por quantidade) em vez
// de refazer o cálculo a cada produto — todas as telas de margem consomem o
// mesmo mapa. `invoices` já deve vir filtrado para a janela desejada (ver
// RECENT_COST_WINDOW_DAYS / store.recentInvoices).
export const buildRecentCostMap = (invoices: TInvoice[]): TProductCostMap => {
  const totals = new Map<string, { cost: number; quantity: number }>()

  invoices.forEach((invoice) => {
    invoice.items.forEach((item) => {
      if (!item.productId) return
      const entry = totals.get(item.productId) ?? { cost: 0, quantity: 0 }
      entry.cost += item.unitPrice * item.quantity
      entry.quantity += item.quantity
      totals.set(item.productId, entry)
    })
  })

  const result: TProductCostMap = new Map()
  totals.forEach((entry, productId) => {
    if (entry.quantity > 0) result.set(productId, entry.cost / entry.quantity)
  })
  return result
}

// Prioridade: custo médio das notas de entrada recentes; sem entrada no
// período, cai pro custo do catálogo (produtocomplemento.custocomimposto).
export const resolveProductCost = (
  product: Pick<TProduct, 'id' | 'costWithTax'>,
  recentCostMap: TProductCostMap
): number | null => recentCostMap.get(product.id) ?? product.costWithTax
