import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TSettings } from '@/models/settings/types'

import { evaluateMargin, getMarginTolerance } from './margin'

const now = Timestamp.now()

const makeSettings = (overrides: Partial<TSettings> = {}): TSettings => ({
  id: 'general',
  pdfDepartmentOrder: [],
  marginTolerance: { below: 0, above: 100 },
  departmentMarginTolerances: {},
  lastCatalogImportAt: null,
  lastInvoiceImportAt: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

describe('evaluateMargin', () => {
  test('returns "ok" when the actual margin is within the floor/ceiling', () => {
    expect(evaluateMargin(30, { below: 25, above: 35 })).toMatchObject({
      status: 'ok',
      marginGap: 0
    })
  })

  test('returns "below" when the actual margin is under the floor', () => {
    expect(evaluateMargin(20, { below: 25, above: 35 })).toMatchObject({
      status: 'below',
      marginGap: 5
    })
  })

  test('returns "above" when the actual margin is over the ceiling', () => {
    expect(evaluateMargin(45, { below: 25, above: 35 })).toMatchObject({
      status: 'above',
      marginGap: 10
    })
  })

  test('treats the floor/ceiling boundaries themselves as "ok"', () => {
    expect(evaluateMargin(25, { below: 25, above: 35 })).toMatchObject({
      status: 'ok'
    })
    expect(evaluateMargin(35, { below: 25, above: 35 })).toMatchObject({
      status: 'ok'
    })
  })
})

describe('getMarginTolerance', () => {
  test('falls back to the default tolerance when settings is null', () => {
    expect(getMarginTolerance(null, null)).toEqual({ below: 0, above: 100 })
    expect(getMarginTolerance(null, 'dept-1')).toEqual({
      below: 0,
      above: 100
    })
  })

  test('uses the global tolerance when there is no department override', () => {
    const settings = makeSettings({ marginTolerance: { below: 30, above: 70 } })
    expect(getMarginTolerance(settings, null)).toEqual({
      below: 30,
      above: 70
    })
    expect(getMarginTolerance(settings, 'dept-without-override')).toEqual({
      below: 30,
      above: 70
    })
  })

  test('prefers the department override over the global tolerance', () => {
    const settings = makeSettings({
      marginTolerance: { below: 30, above: 70 },
      departmentMarginTolerances: {
        'dept-1': { below: 40, above: 60 }
      }
    })
    expect(getMarginTolerance(settings, 'dept-1')).toEqual({
      below: 40,
      above: 60
    })
    expect(getMarginTolerance(settings, 'dept-2')).toEqual({
      below: 30,
      above: 70
    })
  })
})
