import type { TAiSuggestion } from '@/infra'
import type { TFamily, TPriceRef, TProduct, TQuote, TQuoteItem } from '@/models'

import { getFamilyReferencePrice, getReferenceDescription } from '../../utils'

export type TSuggestionRow = {
  item: TQuoteItem
  suggestion: TAiSuggestion
  refName: string | null
  refPrice: number | null
  referenceLabel: string | null
  accepted: boolean
}

const getRefName = (
  s: TAiSuggestion,
  products: TProduct[],
  families: TFamily[]
): string | null => {
  if (s.type === 'product' && s.id)
    return products.find((p) => p.id === s.id)?.description ?? null
  if (s.type === 'family' && s.id)
    return families.find((f) => f.id === s.id)?.description ?? null
  return null
}

const getRefPrice = (s: TAiSuggestion, products: TProduct[]): number | null => {
  if (s.type === 'product' && s.id)
    return products.find((p) => p.id === s.id)?.price ?? null
  if (s.type === 'family' && s.id)
    return getFamilyReferencePrice(products, s.id)
  return null
}

const getReferenceLabel = (
  priceRef: TPriceRef,
  products: TProduct[],
  families: TFamily[]
): string | null => {
  if (!priceRef) return null
  if (priceRef.type === 'manual') return 'Preço definido manualmente'
  return (
    getReferenceDescription(priceRef, products, families) ??
    'Referência não encontrada'
  )
}

const getRowOrder = (row: TSuggestionRow): number => {
  if (row.item.priceRef !== null) return 2
  return row.suggestion.type !== null ? 1 : 0
}

export const buildRows = ({
  items,
  suggestions,
  products,
  families
}: {
  items: TQuoteItem[]
  suggestions: TAiSuggestion[]
  products: TProduct[]
  families: TFamily[]
}): TSuggestionRow[] => {
  const rows = items.map((item) => {
    const s = suggestions.find((s) => s.itemId === item.id) ?? {
      itemId: item.id,
      type: null,
      id: null
    }
    return {
      item,
      suggestion: s,
      refName: getRefName(s, products, families),
      refPrice: getRefPrice(s, products),
      referenceLabel: getReferenceLabel(item.priceRef, products, families),
      accepted: s.type !== null
    }
  })

  return rows.sort((a, b) => getRowOrder(a) - getRowOrder(b))
}

export const isAlreadyReferenced = (itemId: string, quote: TQuote) =>
  (quote.items.find((i) => i.id === itemId)?.priceRef ?? null) !== null
