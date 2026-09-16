import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TPriceAdjustment, TProduct, TSettings } from '@/models'
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

const makeSettings = (overrides: Partial<TSettings> = {}): TSettings => ({
  id: 'general',
  pdfDepartmentOrder: [],
  marginTolerance: { below: 0, above: 0 },
  departmentMarginTolerances: {},
  lastCatalogImportAt: null,
  lastInvoiceImportAt: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

describe('getMarginAlerts', () => {
  test('flags a product whose actual margin is below its target margin', () => {
    // price 100, cost 70 -> actual margin 30%; target margin 40% -> below
    const product = makeProduct({ margin: 40 })
    const adjustment = makePriceAdjustment({ resolvedCost: 70 })

    const { below, above } = getMarginAlerts([product], [adjustment], null)

    expect(above).toEqual([])
    expect(below).toHaveLength(1)
    expect(below[0]).toMatchObject({
      id: 'p1',
      actualMargin: 30,
      targetMargin: 40,
      marginGap: 10,
      status: 'below'
    })
  })

  test('flags a product whose actual margin is above its target margin', () => {
    // price 100, cost 50 -> actual margin 50%; target margin 30% -> above
    const product = makeProduct({ margin: 30 })
    const adjustment = makePriceAdjustment({ resolvedCost: 50 })

    const { below, above } = getMarginAlerts([product], [adjustment], null)

    expect(below).toEqual([])
    expect(above).toHaveLength(1)
    expect(above[0]).toMatchObject({
      id: 'p1',
      actualMargin: 50,
      targetMargin: 30,
      marginGap: -20,
      status: 'above'
    })
  })

  test('does not flag a product exactly at its target margin', () => {
    const atTarget = makeProduct({ id: 'p1', margin: 30 })
    const adjustment = makePriceAdjustment({
      id: 'p1',
      productId: 'p1',
      resolvedCost: 70
    })

    const { below, above } = getMarginAlerts([atTarget], [adjustment], null)

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('respects the global margin tolerance before flagging below/above', () => {
    // price 100, cost 74 -> actual margin 26%; target margin 30% -> gap 4 p.p.
    const product = makeProduct({ margin: 30 })
    const adjustment = makePriceAdjustment({ resolvedCost: 74 })
    const settings = makeSettings({ marginTolerance: { below: 5, above: 5 } })

    const withinTolerance = getMarginAlerts([product], [adjustment], settings)
    expect(withinTolerance.below).toEqual([])
    expect(withinTolerance.above).toEqual([])

    const tighterSettings = makeSettings({
      marginTolerance: { below: 3, above: 3 }
    })
    const exceedsTolerance = getMarginAlerts(
      [product],
      [adjustment],
      tighterSettings
    )
    expect(exceedsTolerance.below).toHaveLength(1)
  })

  test('uses the department override tolerance instead of the global one', () => {
    // price 100, cost 74 -> actual margin 26%; target margin 30% -> gap 4 p.p.
    const product = makeProduct({ margin: 30, departmentId: 'dept-1' })
    const adjustment = makePriceAdjustment({ resolvedCost: 74 })
    const settings = makeSettings({
      marginTolerance: { below: 0, above: 0 },
      departmentMarginTolerances: { 'dept-1': { below: 10, above: 10 } }
    })

    const { below } = getMarginAlerts([product], [adjustment], settings)
    expect(below).toEqual([])
  })

  test('skips products without a target margin, price or resolved cost', () => {
    const noMargin = makeProduct({ id: 'p1', margin: null })
    const noPrice = makeProduct({ id: 'p2', price: 0 })
    const noCostMatch = makeProduct({ id: 'p3' })

    const { below, above } = getMarginAlerts(
      [noMargin, noPrice, noCostMatch],
      [
        makePriceAdjustment({ id: 'p1', productId: 'p1', resolvedCost: 70 }),
        makePriceAdjustment({ id: 'p2', productId: 'p2', resolvedCost: 70 }),
        makePriceAdjustment({ id: 'p3', productId: 'p3', resolvedCost: 0 })
      ],
      null
    )

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('ignores price adjustments with no matching product', () => {
    const { below, above } = getMarginAlerts(
      [],
      [makePriceAdjustment({ productId: 'missing' })],
      null
    )

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('sorts below alerts by the largest margin gap first', () => {
    const small = makeProduct({ id: 'p1', price: 100, margin: 35 })
    const big = makeProduct({ id: 'p2', price: 100, margin: 50 })

    const { below } = getMarginAlerts(
      [small, big],
      [
        // actual margin 30% -> gap of 5 p.p.
        makePriceAdjustment({ id: 'p1', productId: 'p1', resolvedCost: 70 }),
        // actual margin 30% -> gap of 20 p.p.
        makePriceAdjustment({ id: 'p2', productId: 'p2', resolvedCost: 70 })
      ],
      null
    )

    expect(below.map((alert) => alert.id)).toEqual(['p2', 'p1'])
  })

  test('sorts above alerts by the largest excess first', () => {
    const small = makeProduct({ id: 'p1', price: 100, margin: 30 })
    const big = makeProduct({ id: 'p2', price: 100, margin: 30 })

    const { above } = getMarginAlerts(
      [small, big],
      [
        // actual margin 40% -> excess of 10 p.p.
        makePriceAdjustment({ id: 'p1', productId: 'p1', resolvedCost: 60 }),
        // actual margin 60% -> excess of 30 p.p.
        makePriceAdjustment({ id: 'p2', productId: 'p2', resolvedCost: 40 })
      ],
      null
    )

    expect(above.map((alert) => alert.id)).toEqual(['p2', 'p1'])
  })
})
