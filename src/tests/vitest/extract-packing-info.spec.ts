import { describe, expect, test } from 'vitest'

import { extractPackingInfo } from '@/components/blocks/order-form/utils'

describe('extractPackingInfo', () => {
  test('extracts quantity concatenated after the packing type', () => {
    expect(extractPackingInfo('CX24')).toEqual({
      packing: 'CX',
      packingQuantity: 24
    })
  })

  test('extracts quantity separated by a slash', () => {
    expect(extractPackingInfo('CX/24')).toEqual({
      packing: 'CX',
      packingQuantity: 24
    })
    expect(extractPackingInfo('DP/12')).toEqual({
      packing: 'DP',
      packingQuantity: 12
    })
  })

  test('extracts quantity of 1 when concatenated', () => {
    expect(extractPackingInfo('UN1')).toEqual({
      packing: 'UN',
      packingQuantity: 1
    })
  })

  test('is order-agnostic between letters and digits', () => {
    expect(extractPackingInfo('24CX')).toEqual({
      packing: 'CX',
      packingQuantity: 24
    })
  })

  test('resolves word-based multipliers with no digits', () => {
    expect(extractPackingInfo('DZ')).toEqual({
      packing: 'DZ',
      packingQuantity: 12
    })
  })

  test('trims and uppercases before matching', () => {
    expect(extractPackingInfo(' cx/24 ')).toEqual({
      packing: 'CX',
      packingQuantity: 24
    })
  })

  test('returns null when there is nothing to extract', () => {
    expect(extractPackingInfo('CX')).toBeNull()
    expect(extractPackingInfo('UN')).toBeNull()
    expect(extractPackingInfo('')).toBeNull()
    expect(extractPackingInfo(' '.repeat(3))).toBeNull()
  })

  test('returns null for a zero quantity', () => {
    expect(extractPackingInfo('CX0')).toBeNull()
  })
})
