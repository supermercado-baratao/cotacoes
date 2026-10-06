import type { TFamily } from '@/models/family-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TQuoteItem } from '@/models/quote-model/types'

import type { TAiSuggestion } from './gemini'

const normalize = (s: string): string[] =>
  s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/\W+/)
    .filter(Boolean)

const overlap = (a: string[], b: string[]): number => {
  const bSet = new Set(b)
  return a.filter((w) => bSet.has(w)).length
}

export const suggestPriceReferencesLocally = (
  items: TQuoteItem[],
  products: TProduct[],
  families: TFamily[]
): TAiSuggestion[] => {
  const normalizedProducts = products.map((p) => ({
    id: p.id,
    words: normalize(p.description)
  }))
  const normalizedFamilies = families.map((f) => ({
    id: f.id,
    words: normalize(f.description)
  }))

  return items.map((item) => {
    const itemWords = normalize(item.description)

    let bestProductId: string | null = null
    let bestProductScore = 0
    for (const p of normalizedProducts) {
      const s = overlap(itemWords, p.words)
      if (s > bestProductScore) {
        bestProductScore = s
        bestProductId = p.id
      }
    }

    let bestFamilyId: string | null = null
    let bestFamilyScore = 0
    for (const f of normalizedFamilies) {
      const s = overlap(itemWords, f.words)
      if (s > bestFamilyScore) {
        bestFamilyScore = s
        bestFamilyId = f.id
      }
    }

    if (bestProductScore === 0 && bestFamilyScore === 0) {
      return { itemId: item.id, type: null, id: null }
    }

    if (bestFamilyScore >= bestProductScore) {
      return { itemId: item.id, type: 'family', id: bestFamilyId }
    }

    return { itemId: item.id, type: 'product', id: bestProductId }
  })
}
