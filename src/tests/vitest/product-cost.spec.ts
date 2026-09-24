import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TInvoice, TInvoiceItem, TProduct } from '@/models'
import { buildRecentCostMap, resolveProductCost } from '@/utils'

const now = Timestamp.now()

const makeItem = (overrides: Partial<TInvoiceItem> = {}): TInvoiceItem => ({
  itemNumber: 1,
  supplierProductCode: '1',
  barcode: null,
  calculatedBarcode: null,
  packageBarcode: null,
  description: 'item',
  unit: 'UN',
  quantity: 1,
  unitPrice: 10,
  totalPrice: 10,
  tribUnit: 'UN',
  tribQuantity: 1,
  tribUnitPrice: 10,
  productId: 'p1',
  orderId: null,
  matchStatus: 'matched',
  priceDivergence: null,
  quantityDivergence: null,
  ...overrides
})

const makeInvoice = (
  overrides: Partial<TInvoice> & { id: string; items: TInvoiceItem[] }
): TInvoice => ({
  accessKey: overrides.id,
  number: overrides.id,
  series: '1',
  emissionDate: '2026-09-01',
  supplierCnpj: '11111111000111',
  supplierName: 'FORNECEDOR',
  destinationCnpj: '22222222000122',
  totalValue: 0,
  verificationStatus: 'pending',
  quoteId: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

const makeProduct = (overrides: Partial<TProduct> = {}): TProduct => ({
  id: 'p1',
  description: 'produto teste',
  price: 100,
  barcodes: [],
  packTypes: [],
  tax: null,
  margin: 30,
  costWithTax: 50,
  observations: null,
  familyId: null,
  departmentId: null,
  department: '',
  section: '',
  group: '',
  stock: 0,
  vrCreatedAt: '2026-01-01',
  createdAt: now,
  updatedAt: now,
  ...overrides
})

describe('buildRecentCostMap', () => {
  test('averages unit cost weighted by quantity across invoices', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        items: [makeItem({ productId: 'p1', unitPrice: 10, quantity: 8 })]
      }),
      makeInvoice({
        id: 'i2',
        items: [makeItem({ productId: 'p1', unitPrice: 20, quantity: 2 })]
      })
    ]

    // (10*8 + 20*2) / (8+2) = 12
    expect(buildRecentCostMap(invoices).get('p1')).toBe(12)
  })

  test('groups multiple items and products independently', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        items: [
          makeItem({ productId: 'p1', unitPrice: 10, quantity: 1 }),
          makeItem({ productId: 'p2', unitPrice: 5, quantity: 4 })
        ]
      })
    ]

    const map = buildRecentCostMap(invoices)
    expect(map.get('p1')).toBe(10)
    expect(map.get('p2')).toBe(5)
  })

  test('ignores items with no matching product', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        items: [makeItem({ productId: null, unitPrice: 10, quantity: 1 })]
      })
    ]

    expect(buildRecentCostMap(invoices).size).toBe(0)
  })

  test('returns an empty map for no invoices', () => {
    expect(buildRecentCostMap([]).size).toBe(0)
  })
})

describe('resolveProductCost', () => {
  test('prefers the recent invoice average over the catalog cost', () => {
    const product = makeProduct({ id: 'p1', costWithTax: 50 })
    const recentCostMap = new Map([['p1', 12]])

    expect(resolveProductCost(product, recentCostMap)).toBe(12)
  })

  test('falls back to the catalog cost when there is no recent entry', () => {
    const product = makeProduct({ id: 'p1', costWithTax: 50 })

    expect(resolveProductCost(product, new Map())).toBe(50)
  })

  test('returns null when neither a recent entry nor a catalog cost exists', () => {
    const product = makeProduct({ id: 'p1', costWithTax: null })

    expect(resolveProductCost(product, new Map())).toBeNull()
  })
})
