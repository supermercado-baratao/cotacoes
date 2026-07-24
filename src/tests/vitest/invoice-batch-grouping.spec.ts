import { describe, expect, test } from 'vitest'

import type { TInvoiceItem, TQuoteItem } from '@/models'
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
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(rows, [
      familyQuoteItem('q1')
    ])

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
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      [...majority, outlier],
      [familyQuoteItem('q1')]
    )

    expect(batchGroups).toHaveLength(1)
    expect(batchGroups[0].packing).toBe('UN')
    expect(batchGroups[0].rows).toEqual(majority)
    expect(batchGroups[0].outliers).toEqual([outlier])
    expect(individualRows).toEqual([outlier])
  })

  test('falls back to individualRows entirely when there is no packing majority', () => {
    const rows = [makeRow('q1', 'UN'), makeRow('q1', 'CX')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(rows, [
      familyQuoteItem('q1')
    ])

    expect(batchGroups).toHaveLength(0)
    expect(individualRows).toEqual(rows)
  })

  test('never batches quote items referenced by product, even with 2+ rows', () => {
    const rows = [makeRow('q1', 'UN'), makeRow('q1', 'UN')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(rows, [
      productQuoteItem('q1')
    ])

    expect(batchGroups).toHaveLength(0)
    expect(individualRows).toEqual(rows)
  })

  test('does not batch a lone row for a family quote item', () => {
    const rows = [makeRow('q1', 'UN')]
    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(rows, [
      familyQuoteItem('q1')
    ])

    expect(batchGroups).toHaveLength(0)
    expect(individualRows).toEqual(rows)
  })
})
