import { describe, expect, test } from 'vitest'

import { getFamilyMarginStatus, hasDivergentFamilyPrices } from './utils'

describe('hasDivergentFamilyPrices', () => {
  test('returns false for a single row', () => {
    expect(
      hasDivergentFamilyPrices([{ previousPrice: 10, newSalePrice: 12 }])
    ).toBe(false)
  })

  test('returns false when every row shares the same REP prices', () => {
    const row = { previousPrice: 10, newSalePrice: 12 }
    expect(hasDivergentFamilyPrices([row, { ...row }, { ...row }])).toBe(false)
  })

  test('returns true when any row diverges on previousPrice or newSalePrice', () => {
    const row = { previousPrice: 10, newSalePrice: 12 }
    expect(hasDivergentFamilyPrices([row, { ...row, previousPrice: 11 }])).toBe(
      true
    )
    expect(hasDivergentFamilyPrices([row, { ...row, newSalePrice: 13 }])).toBe(
      true
    )
  })
})

describe('getFamilyMarginStatus', () => {
  test('returns null when no row has a margin status', () => {
    expect(
      getFamilyMarginStatus([{ marginStatus: null }, { marginStatus: null }])
    ).toBeNull()
  })

  test('returns the shared status when every row agrees', () => {
    expect(
      getFamilyMarginStatus([{ marginStatus: 'ok' }, { marginStatus: 'ok' }])
    ).toBe('ok')
  })

  test('ignores rows without a margin status when checking agreement', () => {
    expect(
      getFamilyMarginStatus([{ marginStatus: 'below' }, { marginStatus: null }])
    ).toBe('below')
  })

  test('returns "mixed" when rows disagree on margin status', () => {
    expect(
      getFamilyMarginStatus([{ marginStatus: 'ok' }, { marginStatus: 'below' }])
    ).toBe('mixed')
  })
})
