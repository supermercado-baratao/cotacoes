import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TProduct } from '@/models/product/types'

import { filterProducts } from './utils'

const now = Timestamp.now()

const makeProduct = (overrides: Partial<TProduct> = {}): TProduct => ({
  id: '202567',
  description: 'PRODUTO TESTE',
  price: 10,
  barcodes: ['7891000000001'],
  packTypes: ['UN'],
  tax: null,
  margin: null,
  costWithTax: null,
  observations: null,
  familyId: null,
  departmentId: null,
  department: '',
  section: '',
  group: '',
  stock: 0,
  vrCreatedAt: '',
  createdAt: now,
  updatedAt: now,
  ...overrides
})

describe('filterProducts', () => {
  test('matches by codVr (product id)', () => {
    const product = makeProduct({ id: '202567', description: 'ARROZ 5KG' })
    const other = makeProduct({ id: '999999', description: 'FEIJAO 1KG' })

    expect(filterProducts('202567', [product, other])).toEqual([product])
  })

  test('still matches by description and barcode', () => {
    const product = makeProduct({
      id: '202567',
      description: 'ARROZ 5KG',
      barcodes: ['7891000000001']
    })

    expect(filterProducts('arroz', [product])).toEqual([product])
    expect(filterProducts('7891000000001', [product])).toEqual([product])
  })
})
