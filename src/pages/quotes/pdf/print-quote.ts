import { type DocumentProps, pdf } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'

import type { TFamily, TProduct, TQuote } from '@/models'

import { QuotePDF, type TPdfGroup, type TPdfItem } from './quote-pdf'

const resolveCategory = (product: TProduct): string => product.section

type TRawItem = Omit<TPdfItem, 'index'>

const buildGroups = (
  quote: TQuote,
  products: TProduct[],
  families: TFamily[]
): TPdfGroup[] => {
  const groupMap = new Map<string, { label: string; items: TRawItem[] }>()
  const uncategorized: TRawItem[] = []

  for (const item of quote.items) {
    const ref = item.priceRef
    let categoryKey = ''
    let categoryLabel = ''
    let refDescription: string | null = null

    if (ref?.type === 'product') {
      const product = products.find((p) => p.id === ref.id)
      if (product) {
        const category = resolveCategory(product)
        categoryKey = category
        categoryLabel = category
        refDescription = product.description
      }
    } else if (ref?.type === 'family') {
      const family = families.find((f) => f.id === ref.id)
      if (family) {
        refDescription = family.description
      }
      const productOfFamily = products.find((p) => p.familyId === ref.id)
      if (productOfFamily) {
        const category = resolveCategory(productOfFamily)
        categoryKey = category
        categoryLabel = category
      }
    }

    const entry: TRawItem = {
      description: item.description,
      refDescription,
      salePrice: item.salePrice
    }

    if (!categoryKey) {
      uncategorized.push(entry)
      continue
    }

    if (!groupMap.has(categoryKey)) {
      groupMap.set(categoryKey, { label: categoryLabel, items: [] })
    }
    groupMap.get(categoryKey)!.items.push(entry)
  }

  const byLabel = (a: string, b: string) => a.localeCompare(b, 'pt-BR')
  const byDesc = (a: TRawItem, b: TRawItem) =>
    a.description.localeCompare(b.description, 'pt-BR')

  const sorted = [...groupMap.values()]
    .sort((a, b) => byLabel(a.label, b.label))
    .map((g) => ({ ...g, items: [...g.items].sort(byDesc) }))

  if (uncategorized.length > 0) {
    sorted.push({
      label: 'Sem categoria',
      items: [...uncategorized].sort(byDesc)
    })
  }

  let index = 1
  return sorted.map((g) => ({
    ...g,
    items: g.items.map((item) => ({ ...item, index: index++ }))
  }))
}

export const printQuote = async (
  quote: TQuote,
  products: TProduct[],
  families: TFamily[]
): Promise<void> => {
  const groups = buildGroups(quote, products, families)
  const element = createElement(QuotePDF, {
    date: quote.date,
    totalItems: quote.items.length,
    groups
  }) as unknown as ReactElement<DocumentProps>
  const blob = await pdf(element).toBlob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
