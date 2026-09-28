import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TInvoice, TInvoiceItem, TProduct } from '@/models'
import { filterInvoices } from '@/pages/invoices/utils'
import { filterProducts } from '@/pages/products/utils'

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

const makeItem = (overrides: Partial<TInvoiceItem> = {}): TInvoiceItem => ({
  itemNumber: 1,
  supplierProductCode: '1',
  barcode: null,
  calculatedBarcode: null,
  packageBarcode: null,
  description: 'ITEM NF',
  unit: 'UN',
  quantity: 1,
  unitPrice: 10,
  totalPrice: 10,
  tribUnit: 'UN',
  tribQuantity: 1,
  tribUnitPrice: 10,
  productId: null,
  orderId: null,
  matchStatus: 'unmatched_product',
  priceDivergence: null,
  quantityDivergence: null,
  ...overrides
})

const makeInvoice = (overrides: Partial<TInvoice> = {}): TInvoice => ({
  id: 'invoice-1',
  accessKey: '1'.repeat(44),
  number: '1',
  series: '1',
  emissionDate: '2026-01-01T00:00:00-03:00',
  supplierCnpj: '00000000000000',
  supplierName: 'FORNECEDOR TESTE',
  destinationCnpj: '11111111111111',
  totalValue: 10,
  items: [makeItem()],
  verificationStatus: 'pending',
  quoteId: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

describe('filterInvoices', () => {
  test('matches by an item codVr (matched product id)', () => {
    const invoice = makeInvoice({
      items: [makeItem({ productId: '202567', matchStatus: 'matched' })]
    })
    const other = makeInvoice({
      id: 'invoice-2',
      items: [makeItem({ productId: '999999', matchStatus: 'matched' })]
    })

    expect(filterInvoices('202567', [invoice, other])).toEqual([invoice])
  })
})
