import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TPriceAdjustment, TProduct } from '@/models'
import { getMarginAlerts } from '@/pages/dashboard/utils'

const now = Timestamp.now()

const makeProduct = (overrides: Partial<TProduct> = {}): TProduct => ({
  id: 'p1',
  description: 'produto teste',
  price: 100,
  barcodes: [],
  packTypes: [],
  tax: null,
  margin: 30,
  observations: null,
  familyId: null,
  department: '',
  section: '',
  group: '',
  stock: 0,
  vrCreatedAt: '2026-01-01',
  createdAt: now,
  updatedAt: now,
  ...overrides
})

const makePriceAdjustment = (
  overrides: Partial<TPriceAdjustment> = {}
): TPriceAdjustment => ({
  id: 'p1',
  code: 'p1',
  description: 'produto teste',
  previousPrice: 90,
  fileCost: 70,
  newSalePrice: 100,
  lastEntryDate: null,
  changeDateTime: '',
  movementDate: null,
  user: '',
  productId: 'p1',
  productFound: true,
  currentSystemPrice: 100,
  resolvedCost: 70,
  costSource: 'quote',
  quoteDate: null,
  supplierNames: [],
  supplierCosts: [],
  costDivergence: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

describe('getMarginAlerts', () => {
  test('flags a product whose actual margin is below its target margin', () => {
    // price 100, cost 70 -> actual margin 30%; target margin 40% -> below
    const product = makeProduct({ margin: 40 })
    const adjustment = makePriceAdjustment({ resolvedCost: 70 })

    const alerts = getMarginAlerts([product], [adjustment])

    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      id: 'p1',
      actualMargin: 30,
      targetMargin: 40,
      marginGap: 10
    })
  })

  test('does not flag a product at or above its target margin', () => {
    // price 100, cost 70 -> actual margin 30%; target margin 30% -> not below
    const atTarget = makeProduct({ id: 'p1', margin: 30 })
    // price 100, cost 50 -> actual margin 50%; target margin 30% -> above
    const aboveTarget = makeProduct({ id: 'p2', margin: 30 })

    const alerts = getMarginAlerts(
      [atTarget, aboveTarget],
      [
        makePriceAdjustment({ id: 'p1', productId: 'p1', resolvedCost: 70 }),
        makePriceAdjustment({ id: 'p2', productId: 'p2', resolvedCost: 50 })
      ]
    )

    expect(alerts).toEqual([])
  })

  test('skips products without a target margin, price or resolved cost', () => {
    const noMargin = makeProduct({ id: 'p1', margin: null })
    const noPrice = makeProduct({ id: 'p2', price: 0 })
    const noCostMatch = makeProduct({ id: 'p3' })

    const alerts = getMarginAlerts(
      [noMargin, noPrice, noCostMatch],
      [
        makePriceAdjustment({ id: 'p1', productId: 'p1', resolvedCost: 70 }),
        makePriceAdjustment({ id: 'p2', productId: 'p2', resolvedCost: 70 }),
        makePriceAdjustment({ id: 'p3', productId: 'p3', resolvedCost: 0 })
      ]
    )

    expect(alerts).toEqual([])
  })

  test('ignores price adjustments with no matching product', () => {
    const alerts = getMarginAlerts(
      [],
      [makePriceAdjustment({ productId: 'missing' })]
    )

    expect(alerts).toEqual([])
  })

  test('sorts alerts by the largest margin gap first', () => {
    const small = makeProduct({ id: 'p1', price: 100, margin: 35 })
    const big = makeProduct({ id: 'p2', price: 100, margin: 50 })

    const alerts = getMarginAlerts(
      [small, big],
      [
        // actual margin 30% -> gap of 5 p.p.
        makePriceAdjustment({ id: 'p1', productId: 'p1', resolvedCost: 70 }),
        // actual margin 30% -> gap of 20 p.p.
        makePriceAdjustment({ id: 'p2', productId: 'p2', resolvedCost: 70 })
      ]
    )

    expect(alerts.map((alert) => alert.id)).toEqual(['p2', 'p1'])
  })
})
