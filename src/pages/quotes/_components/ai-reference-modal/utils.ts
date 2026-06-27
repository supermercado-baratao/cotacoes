import type { TAiSuggestion } from '@/infra'
import type { TFamily, TProduct, TQuote, TQuoteItem } from '@/models'

export type TSuggestionRow = {
  item: TQuoteItem
  suggestion: TAiSuggestion
  refName: string | null
  refPrice: number | null
  accepted: boolean
}

type TCache = { itemIds: string[]; suggestions: TAiSuggestion[] }

const cacheKey = (quoteId: string) => `ai-ref-v1-${quoteId}`

export const loadFromCache = (
  quoteId: string,
  itemIds: string[]
): TAiSuggestion[] | null => {
  try {
    const raw = localStorage.getItem(cacheKey(quoteId))
    if (!raw) return null
    const cache = JSON.parse(raw) as TCache
    const cachedSet = new Set(cache.itemIds)
    if (!itemIds.every((id) => cachedSet.has(id))) return null
    return cache.suggestions
  } catch {
    return null
  }
}

export const saveToCache = (
  quoteId: string,
  itemIds: string[],
  suggestions: TAiSuggestion[]
) => {
  localStorage.setItem(
    cacheKey(quoteId),
    JSON.stringify({ itemIds, suggestions } satisfies TCache)
  )
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
    return products.find((p) => p.familyId === s.id)?.price ?? null
  return null
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
}): TSuggestionRow[] =>
  items.map((item) => {
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
      accepted: s.type !== null
    }
  })

export const isAlreadyReferenced = (itemId: string, quote: TQuote) =>
  (quote.items.find((i) => i.id === itemId)?.priceRef ?? null) !== null
