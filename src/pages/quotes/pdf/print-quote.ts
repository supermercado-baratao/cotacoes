import { type DocumentProps, pdf } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'

import type { TFamily, TProduct, TQuote } from '@/models'

import {
  QuotePDF,
  type TPdfDepartment,
  type TPdfGroup,
  type TPdfItem,
  type TPdfSection
} from './quote-pdf'

type TRawItem = Omit<TPdfItem, 'index'>

const resolveProduct = (
  priceRef: TQuote['items'][number]['priceRef'],
  products: TProduct[]
): TProduct | null => {
  if (priceRef?.type === 'product') {
    return products.find((p) => p.id === priceRef.id) ?? null
  }
  if (priceRef?.type === 'family') {
    return products.find((p) => p.familyId === priceRef.id) ?? null
  }
  return null
}

const buildDepartments = (
  quote: TQuote,
  products: TProduct[],
  families: TFamily[],
  departmentOrder: string[]
): TPdfDepartment[] => {
  type TGroupBucket = { label: string; items: TRawItem[] }
  const departmentMap = new Map<
    string,
    Map<string, Map<string, TGroupBucket>>
  >()
  const uncategorized: TRawItem[] = []

  for (const item of quote.items) {
    const ref = item.priceRef
    let refDescription: string | null = null

    if (ref?.type === 'product') {
      refDescription =
        products.find((p) => p.id === ref.id)?.description ?? null
    } else if (ref?.type === 'family') {
      refDescription =
        families.find((f) => f.id === ref.id)?.description ?? null
    }

    const entry: TRawItem = {
      description: item.description,
      refDescription,
      salePrice: item.salePrice
    }

    const product = resolveProduct(ref, products)
    if (!product) {
      uncategorized.push(entry)
      continue
    }

    const { department, section, group } = product
    if (!departmentMap.has(department)) departmentMap.set(department, new Map())
    const sectionMap = departmentMap.get(department)!

    if (!sectionMap.has(section)) sectionMap.set(section, new Map())
    const groupMap = sectionMap.get(section)!

    if (!groupMap.has(group)) groupMap.set(group, { label: group, items: [] })
    groupMap.get(group)!.items.push(entry)
  }

  const byLabel = (a: string, b: string) => a.localeCompare(b, 'pt-BR')
  const byDesc = (a: TRawItem, b: TRawItem) =>
    a.description.localeCompare(b.description, 'pt-BR')
  const byDepartmentOrder = (a: string, b: string) => {
    const ia = departmentOrder.indexOf(a)
    const ib = departmentOrder.indexOf(b)
    if (ia === -1 && ib === -1) return byLabel(a, b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  }

  let index = 1
  const withIndex = (items: TRawItem[]): TPdfItem[] =>
    [...items]
      .sort(byDesc)
      .map((item) => ({ ...item, index: index++ }) satisfies TPdfItem)

  const departments: TPdfDepartment[] = [...departmentMap.entries()]
    .sort(([a], [b]) => byDepartmentOrder(a, b))
    .map(
      ([departmentLabel, sectionMap]): TPdfDepartment => ({
        label: departmentLabel,
        sections: [...sectionMap.entries()]
          .sort(([a], [b]) => byLabel(a, b))
          .map(
            ([sectionLabel, groupMap]): TPdfSection => ({
              label: sectionLabel,
              groups: [...groupMap.values()]
                .sort((a, b) => byLabel(a.label, b.label))
                .map(
                  (g): TPdfGroup => ({
                    label: g.label,
                    items: withIndex(g.items)
                  })
                )
            })
          )
      })
    )

  if (uncategorized.length > 0) {
    departments.push({
      label: 'Sem categoria',
      sections: [
        { label: '', groups: [{ label: '', items: withIndex(uncategorized) }] }
      ]
    })
  }

  return departments
}

export const printQuote = async (
  quote: TQuote,
  products: TProduct[],
  families: TFamily[],
  departmentOrder: string[]
): Promise<void> => {
  const departments = buildDepartments(
    quote,
    products,
    families,
    departmentOrder
  )
  const element = createElement(QuotePDF, {
    date: quote.date,
    totalItems: quote.items.length,
    departments
  }) as unknown as ReactElement<DocumentProps>
  const blob = await pdf(element).toBlob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
