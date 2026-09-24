import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TInvoiceItem, TProduct, TQuoteItem } from '@/models'
import {
  groupInvoiceItemsForBatch,
  type TLinkOrderRow
} from '@/pages/invoices/utils'

let itemNumber = 0

const makeItem = (unit: string): TInvoiceItem => {
  itemNumber += 1
  return {
    itemNumber,
    supplierProductCode: String(itemNumber),
    barcode: null,
    calculatedBarcode: null,
    packageBarcode: null,
    description: `ITEM ${itemNumber}`,
    unit,
    quantity: 1,
    unitPrice: 10,
    totalPrice: 10,
    tribUnit: unit,
    tribQuantity: 1,
    tribUnitPrice: 10,
    productId: `product-${itemNumber}`,
    orderId: null,
    matchStatus: 'matched',
    priceDivergence: null,
    quantityDivergence: null
  }
}

const makeRow = (quoteItemId: string, unit: string): TLinkOrderRow => {
  const item = makeItem(unit)
  return { item, productId: item.productId, quoteItemId }
}

const makeProduct = (id: string, familyId: string | null): TProduct => ({
  id,
  description: id,
  price: 10,
  barcodes: [],
  packTypes: [],
  tax: null,
  margin: null,
  costWithTax: null,
  observations: null,
  familyId,
  departmentId: null,
  department: '',
  section: '',
  group: '',
  stock: 0,
  vrCreatedAt: '',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
})

const productsForRows = (rows: TLinkOrderRow[], familyId: string): TProduct[] =>
  rows.map((row) => makeProduct(row.productId!, familyId))

const familyQuoteItem = (id: string): TQuoteItem => ({
  id,
  description: `FAMILY ${id}`,
  salePrice: null,
  priceRef: { type: 'family', id: `family-${id}` }
})

const productQuoteItem = (id: string): TQuoteItem => ({
  id,
  description: `PRODUCT ${id}`,
  salePrice: null,
  priceRef: { type: 'product', id: `product-ref-${id}` }
})

describe('groupInvoiceItemsForBatch', () => {
  test('groups rows for the same family quote item with uniform packing', () => {
    const rows = [makeRow('q1', 'UN'), makeRow('q1', 'UN')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows,
      [familyQuoteItem('q1')],
      productsForRows(rows, 'family-q1')
    )

    expect(batchGroups).toHaveLength(1)
    expect(batchGroups[0].quoteItemId).toBe('q1')
    expect(batchGroups[0].packing).toBe('UN')
    expect(batchGroups[0].rows).toEqual(rows)
    expect(batchGroups[0].outliers).toHaveLength(0)
    expect(individualRows).toHaveLength(0)
  })

  test('batches only the majority packing and sends the outlier to individualRows', () => {
    const majority = [makeRow('q1', 'UN'), makeRow('q1', 'UN')]
    const outlier = makeRow('q1', 'CX')
    const rows = [...majority, outlier]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows,
      [familyQuoteItem('q1')],
      productsForRows(rows, 'family-q1')
    )

    expect(batchGroups).toHaveLength(1)
    expect(batchGroups[0].packing).toBe('UN')
    expect(batchGroups[0].rows).toEqual(majority)
    expect(batchGroups[0].outliers).toEqual([outlier])
    expect(individualRows).toEqual([outlier])
  })

  test('falls back to individualRows entirely when there is no packing majority', () => {
    const rows = [makeRow('q1', 'UN'), makeRow('q1', 'CX')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows,
      [familyQuoteItem('q1')],
      productsForRows(rows, 'family-q1')
    )

    expect(batchGroups).toHaveLength(0)
    expect(individualRows).toEqual(rows)
  })

  test('never batches quote items referenced by product, even with 2+ rows', () => {
    const rows = [makeRow('q1', 'UN'), makeRow('q1', 'UN')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows,
      [productQuoteItem('q1')],
      productsForRows(rows, 'family-q1')
    )

    expect(batchGroups).toHaveLength(0)
    expect(individualRows).toEqual(rows)
  })

  test('does not batch a lone row for a family quote item', () => {
    const rows = [makeRow('q1', 'UN')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows,
      [familyQuoteItem('q1')],
      productsForRows(rows, 'family-q1')
    )

    expect(batchGroups).toHaveLength(0)
    expect(individualRows).toEqual(rows)
  })

  test('never mixes different product families sharing the same quote item, even with matching packing', () => {
    const family500ml = [makeRow('q1', 'UN'), makeRow('q1', 'UN')]
    const family2L = [makeRow('q1', 'UN'), makeRow('q1', 'UN')]
    const rows = [...family500ml, ...family2L]
    const products = [
      ...productsForRows(family500ml, 'family-500ml'),
      ...productsForRows(family2L, 'family-2L')
    ]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows,
      [familyQuoteItem('q1')],
      products
    )

    expect(batchGroups).toHaveLength(2)
    const groupedRowSets = batchGroups.map((g) => g.rows)
    expect(groupedRowSets).toContainEqual(family500ml)
    expect(groupedRowSets).toContainEqual(family2L)
    expect(individualRows).toHaveLength(0)
  })

  test('splits an outlier row without a matching product into its own individual row', () => {
    const rows = [makeRow('q1', 'UN'), makeRow('q1', 'UN')]
    const products = [makeProduct(rows[0].productId!, 'family-q1')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows,
      [familyQuoteItem('q1')],
      products
    )

    expect(batchGroups).toHaveLength(0)
    expect(individualRows).toEqual(rows)
  })
})
