import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TSettings } from '@/models'
import { evaluateMargin, getMarginTolerance } from '@/utils'

const now = Timestamp.now()

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

describe('evaluateMargin', () => {
  test('returns "ok" when the gap is within tolerance', () => {
    expect(evaluateMargin(30, 27, { below: 5, above: 5 })).toMatchObject({
      status: 'ok',
      marginGap: 3
    })
  })

  test('returns "below" when the actual margin is under target beyond tolerance', () => {
    expect(evaluateMargin(30, 20, { below: 5, above: 5 })).toMatchObject({
      status: 'below',
      marginGap: 10
    })
  })

  test('returns "above" when the actual margin is over target beyond tolerance', () => {
    expect(evaluateMargin(30, 45, { below: 5, above: 5 })).toMatchObject({
      status: 'above',
      marginGap: -15
    })
  })

  test('treats a gap exactly at the tolerance boundary as "ok"', () => {
    expect(evaluateMargin(30, 25, { below: 5, above: 5 })).toMatchObject({
      status: 'ok'
    })
    expect(evaluateMargin(30, 35, { below: 5, above: 5 })).toMatchObject({
      status: 'ok'
    })
  })

  test('with zero tolerance, any deviation is flagged', () => {
    expect(evaluateMargin(30, 29.9, { below: 0, above: 0 }).status).toBe(
      'below'
    )
    expect(evaluateMargin(30, 30.1, { below: 0, above: 0 }).status).toBe(
      'above'
    )
    expect(evaluateMargin(30, 30, { below: 0, above: 0 }).status).toBe('ok')
  })
})

describe('getMarginTolerance', () => {
  test('falls back to the default tolerance when settings is null', () => {
    expect(getMarginTolerance(null, null)).toEqual({ below: 0, above: 0 })
    expect(getMarginTolerance(null, 'dept-1')).toEqual({ below: 0, above: 0 })
  })

  test('uses the global tolerance when there is no department override', () => {
    const settings = makeSettings({ marginTolerance: { below: 3, above: 7 } })
    expect(getMarginTolerance(settings, null)).toEqual({ below: 3, above: 7 })
    expect(getMarginTolerance(settings, 'dept-without-override')).toEqual({
      below: 3,
      above: 7
    })
  })

  test('prefers the department override over the global tolerance', () => {
    const settings = makeSettings({
      marginTolerance: { below: 3, above: 7 },
      departmentMarginTolerances: {
        'dept-1': { below: 10, above: 10 }
      }
    })
    expect(getMarginTolerance(settings, 'dept-1')).toEqual({
      below: 10,
      above: 10
    })
    expect(getMarginTolerance(settings, 'dept-2')).toEqual({
      below: 3,
      above: 7
    })
  })
})
