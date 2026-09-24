import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TInvoice, TInvoiceItem, TProduct, TSettings } from '@/models'
import {
  buildLastEntryDateMap,
  buildProductIdsWithEntryInRange,
  filterMarginAlertsByEntryPeriod,
  getInvoiceEntriesForProduct,
  getMarginAlerts
} from '@/pages/dashboard/utils'

const now = Timestamp.now()

const noEntries = new Map<string, string>()

const makeProduct = (overrides: Partial<TProduct> = {}): TProduct => ({
  id: 'p1',
  description: 'produto teste',
  price: 100,
  barcodes: [],
  packTypes: [],
  tax: null,
  margin: null,
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
  marginTolerance: { below: 25, above: 35 },
  departmentMarginTolerances: {},
  lastCatalogImportAt: null,
  lastInvoiceImportAt: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

const makeInvoiceItem = (
  overrides: Partial<TInvoiceItem> = {}
): TInvoiceItem => ({
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

describe('getMarginAlerts', () => {
  test('flags a product whose actual margin is under the minimum margin', () => {
    // price 100, cost 80 -> actual margin 20%; floor 25% -> below
    const product = makeProduct({ costWithTax: 80 })
    const settings = makeSettings({ marginTolerance: { below: 25, above: 35 } })

    const { below, above } = getMarginAlerts([product], settings, noEntries)

    expect(above).toEqual([])
    expect(below).toHaveLength(1)
    expect(below[0]).toMatchObject({
      id: 'p1',
      actualMargin: 20,
      thresholdMargin: 25,
      marginGap: 5,
      status: 'below',
      updatedAt: product.updatedAt,
      vrCreatedAt: product.vrCreatedAt,
      lastEntryDate: null
    })
  })

  test('flags a product whose actual margin is over the maximum margin', () => {
    // price 100, cost 50 -> actual margin 50%; ceiling 35% -> above
    const product = makeProduct({ costWithTax: 50 })
    const settings = makeSettings({ marginTolerance: { below: 25, above: 35 } })

    const { below, above } = getMarginAlerts([product], settings, noEntries)

    expect(below).toEqual([])
    expect(above).toHaveLength(1)
    expect(above[0]).toMatchObject({
      id: 'p1',
      actualMargin: 50,
      thresholdMargin: 35,
      marginGap: 15,
      status: 'above'
    })
  })

  test('does not flag a product within the floor/ceiling range', () => {
    const withinRange = makeProduct({ id: 'p1', costWithTax: 70 })
    const settings = makeSettings({ marginTolerance: { below: 25, above: 35 } })

    const { below, above } = getMarginAlerts([withinRange], settings, noEntries)

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('falls back to an inert default tolerance when settings is null', () => {
    // price 100, cost 70 -> actual margin 30%; default floor 0% / ceiling
    // 100% never trips for a normal positive margin.
    const product = makeProduct({ costWithTax: 70 })

    const { below, above } = getMarginAlerts([product], null, noEntries)

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('uses the department override tolerance instead of the global one', () => {
    // price 100, cost 74 -> actual margin 26%; global floor 25 -> below,
    // department override floor 20 -> ok
    const product = makeProduct({ costWithTax: 74, departmentId: 'dept-1' })
    const settings = makeSettings({
      marginTolerance: { below: 25, above: 35 },
      departmentMarginTolerances: { 'dept-1': { below: 20, above: 35 } }
    })

    const { below } = getMarginAlerts([product], settings, noEntries)
    expect(below).toEqual([])
  })

  test('skips products without a price or a registered cost', () => {
    const noPrice = makeProduct({ id: 'p2', price: 0, costWithTax: 70 })
    const noCost = makeProduct({ id: 'p3', costWithTax: null })
    const settings = makeSettings({ marginTolerance: { below: 25, above: 35 } })

    const { below, above } = getMarginAlerts(
      [noPrice, noCost],
      settings,
      noEntries
    )

    expect(below).toEqual([])
    expect(above).toEqual([])
  })

  test('sorts below alerts by the largest margin gap first', () => {
    const settings = makeSettings({ marginTolerance: { below: 30, above: 35 } })
    // actual margin 25% -> gap of 5 p.p.
    const small = makeProduct({ id: 'p1', price: 100, costWithTax: 75 })
    // actual margin 10% -> gap of 20 p.p.
    const big = makeProduct({ id: 'p2', price: 100, costWithTax: 90 })

    const { below } = getMarginAlerts([small, big], settings, noEntries)

    expect(below.map((alert) => alert.id)).toEqual(['p2', 'p1'])
  })

  test('sorts above alerts by the largest excess first', () => {
    const settings = makeSettings({ marginTolerance: { below: 0, above: 30 } })
    // actual margin 40% -> excess of 10 p.p.
    const small = makeProduct({ id: 'p1', price: 100, costWithTax: 60 })
    // actual margin 60% -> excess of 30 p.p.
    const big = makeProduct({ id: 'p2', price: 100, costWithTax: 40 })

    const { above } = getMarginAlerts([small, big], settings, noEntries)

    expect(above.map((alert) => alert.id)).toEqual(['p2', 'p1'])
  })

  test('reads the last entry date from the map when one exists for the product', () => {
    const product = makeProduct({ id: 'p1', costWithTax: 80 })
    const settings = makeSettings({ marginTolerance: { below: 25, above: 35 } })
    const entries = new Map([['p1', '2026-09-10']])

    const { below } = getMarginAlerts([product], settings, entries)

    expect(below[0]).toMatchObject({ lastEntryDate: '2026-09-10' })
  })
})

describe('buildLastEntryDateMap', () => {
  test('keeps the most recent emission date per product', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        emissionDate: '2026-08-01',
        items: [makeInvoiceItem({ productId: 'p1' })]
      }),
      makeInvoice({
        id: 'i2',
        emissionDate: '2026-09-01',
        items: [makeInvoiceItem({ productId: 'p1' })]
      })
    ]

    expect(buildLastEntryDateMap(invoices).get('p1')).toBe('2026-09-01')
  })

  test('ignores items with no matching product', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        items: [makeInvoiceItem({ productId: null })]
      })
    ]

    expect(buildLastEntryDateMap(invoices).size).toBe(0)
  })
})

describe('buildProductIdsWithEntryInRange', () => {
  test('returns product ids present in invoices whose emission date falls within the range', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        emissionDate: '2026-09-10',
        items: [makeInvoiceItem({ productId: 'p1' })]
      }),
      makeInvoice({
        id: 'i2',
        emissionDate: '2026-01-01',
        items: [makeInvoiceItem({ productId: 'p2' })]
      })
    ]

    const productIds = buildProductIdsWithEntryInRange(invoices, {
      startDate: '2026-09-01',
      endDate: '2026-09-30'
    })

    expect(productIds.has('p1')).toBe(true)
    expect(productIds.has('p2')).toBe(false)
  })

  test('ignores items with no matching product', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        emissionDate: '2026-09-10',
        items: [makeInvoiceItem({ productId: null })]
      })
    ]

    const productIds = buildProductIdsWithEntryInRange(invoices, {
      startDate: '2026-09-01',
      endDate: '2026-09-30'
    })

    expect(productIds.size).toBe(0)
  })
})

describe('filterMarginAlertsByEntryPeriod', () => {
  const alertWith = (id: string) => ({
    id,
    description: '',
    price: 100,
    cost: 70,
    thresholdMargin: 25,
    actualMargin: 30,
    marginGap: 0,
    status: 'below' as const,
    updatedAt: now,
    vrCreatedAt: '2026-01-01',
    lastEntryDate: null
  })

  test('returns everything unfiltered when the period filter is disabled (null set)', () => {
    const alerts = { below: [alertWith('p1')], above: [] }
    expect(filterMarginAlertsByEntryPeriod(alerts, null)).toEqual(alerts)
  })

  test('keeps only alerts whose product was found in an invoice within the period', () => {
    const alerts = {
      below: [alertWith('p1'), alertWith('p2')],
      above: []
    }

    const { below } = filterMarginAlertsByEntryPeriod(alerts, new Set(['p1']))

    expect(below.map((a) => a.id)).toEqual(['p1'])
  })

  test('excludes alerts for products with no matched invoice entry in the period', () => {
    const alerts = { below: [alertWith('p1')], above: [] }

    const { below } = filterMarginAlertsByEntryPeriod(alerts, new Set())

    expect(below).toEqual([])
  })
})

describe('getInvoiceEntriesForProduct', () => {
  test('returns the invoice and matching item for entries within the range', () => {
    const itemP1 = makeInvoiceItem({ productId: 'p1', itemNumber: 1 })
    const itemP2 = makeInvoiceItem({ productId: 'p2', itemNumber: 2 })
    const invoices = [
      makeInvoice({ id: 'i1', emissionDate: '2026-09-10', items: [itemP1] }),
      makeInvoice({ id: 'i2', emissionDate: '2026-09-15', items: [itemP2] })
    ]

    const entries = getInvoiceEntriesForProduct(invoices, 'p1', {
      startDate: '2026-09-01',
      endDate: '2026-09-30'
    })

    expect(entries).toEqual([{ invoice: invoices[0], item: itemP1 }])
  })

  test('excludes entries outside the range', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        emissionDate: '2026-01-01',
        items: [makeInvoiceItem({ productId: 'p1' })]
      })
    ]

    const entries = getInvoiceEntriesForProduct(invoices, 'p1', {
      startDate: '2026-09-01',
      endDate: '2026-09-30'
    })

    expect(entries).toEqual([])
  })

  test('ignores the range restriction when it is null', () => {
    const invoices = [
      makeInvoice({
        id: 'i1',
        emissionDate: '2026-01-01',
        items: [makeInvoiceItem({ productId: 'p1' })]
      })
    ]

    const entries = getInvoiceEntriesForProduct(invoices, 'p1', null)

    expect(entries).toHaveLength(1)
  })

  test('sorts entries by emission date, most recent first', () => {
    const older = makeInvoiceItem({ productId: 'p1', itemNumber: 1 })
    const newer = makeInvoiceItem({ productId: 'p1', itemNumber: 2 })
    const invoices = [
      makeInvoice({ id: 'i1', emissionDate: '2026-09-01', items: [older] }),
      makeInvoice({ id: 'i2', emissionDate: '2026-09-20', items: [newer] })
    ]

    const entries = getInvoiceEntriesForProduct(invoices, 'p1', null)

    expect(entries.map((e) => e.invoice.id)).toEqual(['i2', 'i1'])
  })
})
