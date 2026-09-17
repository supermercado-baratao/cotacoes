import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TProduct, TSettings } from '@/models'
import { getMarginAlerts } from '@/pages/dashboard/utils'
import type { TProductCostMap } from '@/utils'

const now = Timestamp.now()

const noCosts: TProductCostMap = new Map()

const makeProduct = (overrides: Partial<TProduct> = {}): TProduct => ({
  id: 'p1',
  description: 'produto teste',
  price: 100,
  barcodes: [],
  packTypes: [],
  tax: null,
  margin: 30,
  costWithTax: 70,
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
    const product = makeProduct({ margin: 40, costWithTax: 70 })

    const { below, above } = getMarginAlerts([product], noCosts, null)

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
    const product = makeProduct({ margin: 30, costWithTax: 50 })

    const { below, above } = getMarginAlerts([product], noCosts, null)

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
    const atTarget = makeProduct({ id: 'p1', margin: 30, costWithTax: 70 })

    const { below, above } = getMarginAlerts([atTarget], noCosts, null)

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('respects the global margin tolerance before flagging below/above', () => {
    // price 100, cost 74 -> actual margin 26%; target margin 30% -> gap 4 p.p.
    const product = makeProduct({ margin: 30, costWithTax: 74 })
    const settings = makeSettings({ marginTolerance: { below: 5, above: 5 } })

    const withinTolerance = getMarginAlerts([product], noCosts, settings)
    expect(withinTolerance.below).toEqual([])
    expect(withinTolerance.above).toEqual([])

    const tighterSettings = makeSettings({
      marginTolerance: { below: 3, above: 3 }
    })
    const exceedsTolerance = getMarginAlerts(
      [product],
      noCosts,
      tighterSettings
    )
    expect(exceedsTolerance.below).toHaveLength(1)
  })

  test('uses the department override tolerance instead of the global one', () => {
    // price 100, cost 74 -> actual margin 26%; target margin 30% -> gap 4 p.p.
    const product = makeProduct({
      margin: 30,
      costWithTax: 74,
      departmentId: 'dept-1'
    })
    const settings = makeSettings({
      marginTolerance: { below: 0, above: 0 },
      departmentMarginTolerances: { 'dept-1': { below: 10, above: 10 } }
    })

    const { below } = getMarginAlerts([product], noCosts, settings)
    expect(below).toEqual([])
  })

  test('skips products without a target margin, price or resolved cost', () => {
    const noMargin = makeProduct({ id: 'p1', margin: null, costWithTax: 70 })
    const noPrice = makeProduct({ id: 'p2', price: 0, costWithTax: 70 })
    const noCostMatch = makeProduct({ id: 'p3', costWithTax: null })

    const { below, above } = getMarginAlerts(
      [noMargin, noPrice, noCostMatch],
      noCosts,
      null
    )

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('uses the recent invoice cost average when one exists for the product', () => {
    // recentCostMap overrides costWithTax's fallback -> actual margin 40%
    const product = makeProduct({ id: 'p1', margin: 40, costWithTax: 70 })
    const recentCostMap: TProductCostMap = new Map([['p1', 60]])

    const { below, above } = getMarginAlerts([product], recentCostMap, null)

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('sorts below alerts by the largest margin gap first', () => {
    // actual margin 30% -> gap of 5 p.p.
    const small = makeProduct({
      id: 'p1',
      price: 100,
      margin: 35,
      costWithTax: 70
    })
    // actual margin 30% -> gap of 20 p.p.
    const big = makeProduct({
      id: 'p2',
      price: 100,
      margin: 50,
      costWithTax: 70
    })

    const { below } = getMarginAlerts([small, big], noCosts, null)

    expect(below.map((alert) => alert.id)).toEqual(['p2', 'p1'])
  })

  test('sorts above alerts by the largest excess first', () => {
    // actual margin 40% -> excess of 10 p.p.
    const small = makeProduct({
      id: 'p1',
      price: 100,
      margin: 30,
      costWithTax: 60
    })
    // actual margin 60% -> excess of 30 p.p.
    const big = makeProduct({
      id: 'p2',
      price: 100,
      margin: 30,
      costWithTax: 40
    })

    const { above } = getMarginAlerts([small, big], noCosts, null)

    expect(above.map((alert) => alert.id)).toEqual(['p2', 'p1'])
  })
})
