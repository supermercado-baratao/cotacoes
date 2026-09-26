import { Timestamp } from 'firebase/firestore'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { invoiceModel, type TInvoice, type TInvoiceItem } from '@/models'
import { parseNfe } from '@/pages/invoices/utils'
import { completeInvoiceFiscalData, hasMissingFiscalData } from '@/utils'

import { getSeededCollection, seedCollection } from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { clearData, createUser } from './orchestrator'

const now = Timestamp.now()

// Nota de bonificação (CFOP 5910) — a mesma usada em entry-cost.spec.ts.
const BONUS_XML =
  'quotes/quote-2-2026-04-01-2026-05-31/NFe29260405853741000139550010009557151161245134.xml'

const loadParsed = async () => {
  const xml = (await readMockFile(BONUS_XML)).toString('utf-8')
  return parseNfe(xml, [])
}

// Simula uma nota gravada antes dos campos fiscais: sem natOp e sem os
// campos por item, mas com vínculos e conferência feitos no app.
const LEGACY_MISSING_ITEM_FIELDS = [
  'tribUnit',
  'tribQuantity',
  'tribUnitPrice',
  'cfop',
  'totalCost'
] as const

const toLegacyInvoice = (
  parsed: Awaited<ReturnType<typeof loadParsed>>
): TInvoice => {
  const invoice = {
    ...parsed,
    verificationStatus: 'approved',
    quoteId: 'quote-1',
    items: parsed.items.map((item) => {
      const legacyItem = {
        ...item,
        productId: 'p1',
        orderId: `order-${item.itemNumber}`,
        matchStatus: 'matched'
      } as Partial<TInvoiceItem>
      LEGACY_MISSING_ITEM_FIELDS.forEach((field) => delete legacyItem[field])
      return legacyItem
    }),
    createdAt: now,
    updatedAt: now
  } as TInvoice
  delete invoice.operationNature
  return invoice
}

describe('hasMissingFiscalData', () => {
  test('is true for invoices stored before the fiscal fields', async () => {
    const legacy = toLegacyInvoice(await loadParsed())
    expect(hasMissingFiscalData(legacy)).toBe(true)
  })

  test('is false for freshly parsed invoices, even with null values', async () => {
    const parsed = await loadParsed()
    const withNullCfop = {
      ...parsed,
      items: parsed.items.map((item) => ({ ...item, cfop: null }))
    }
    expect(hasMissingFiscalData(parsed)).toBe(false)
    expect(hasMissingFiscalData(withNullCfop)).toBe(false)
  })
})

describe('completeInvoiceFiscalData', () => {
  test('fills only the missing fiscal fields and keeps links and verification', async () => {
    const parsed = await loadParsed()
    const legacy = toLegacyInvoice(parsed)

    const completion = completeInvoiceFiscalData(legacy, parsed)
    const completed = { ...legacy, ...completion }

    expect(completed.operationNature).toBe('BONIFICACAO, DOACAO OU BRINDE')
    expect(completed.verificationStatus).toBe('approved')
    expect(completed.quoteId).toBe('quote-1')
    completed.items.forEach((item, i) => {
      expect(item).toMatchObject({
        productId: 'p1',
        orderId: `order-${item.itemNumber}`,
        cfop: '5910',
        totalCost: parsed.items[i].totalCost,
        tribUnit: parsed.items[i].tribUnit
      })
    })
    expect(hasMissingFiscalData(completed)).toBe(false)
  })

  test('does not overwrite fiscal values already stored', async () => {
    const parsed = await loadParsed()
    const legacy = toLegacyInvoice(parsed)
    legacy.operationNature = 'EDITADO'
    legacy.items[0] = { ...legacy.items[0], cfop: '5102' }

    const completion = completeInvoiceFiscalData(legacy, parsed)

    expect(completion.operationNature).toBe('EDITADO')
    expect(completion.items[0].cfop).toBe('5102')
  })

  test('leaves an item untouched when the XML item does not match it', async () => {
    const parsed = await loadParsed()
    const legacy = toLegacyInvoice(parsed)
    legacy.items[0] = { ...legacy.items[0], supplierProductCode: 'OUTRO' }

    const completion = completeInvoiceFiscalData(legacy, parsed)

    expect(completion.items[0]).toEqual(legacy.items[0])
    expect(completion.items[0].cfop).toBeUndefined()
  })
})

describe('invoiceModel.createMany', () => {
  beforeEach(() => {
    createUser()
  })

  afterEach(() => {
    clearData()
  })

  test('completes existing invoices missing fiscal data instead of skipping them', async () => {
    const parsed = await loadParsed()
    const legacy = toLegacyInvoice(parsed)
    seedCollection('invoices', [legacy])

    const { created, completed } = await invoiceModel.createMany([parsed])

    expect(created).toEqual([])
    expect(completed).toHaveLength(1)
    const [stored] = getSeededCollection('invoices') as unknown as TInvoice[]
    expect(stored.operationNature).toBe('BONIFICACAO, DOACAO OU BRINDE')
    expect(stored.verificationStatus).toBe('approved')
    expect(stored.items.every((item) => item.cfop === '5910')).toBe(true)
    expect(stored.items.every((item) => item.orderId !== null)).toBe(true)
  })

  test('skips existing invoices that already have the fiscal data', async () => {
    const parsed = await loadParsed()
    seedCollection('invoices', [{ ...parsed, createdAt: now, updatedAt: now }])

    const { created, completed } = await invoiceModel.createMany([parsed])

    expect(created).toEqual([])
    expect(completed).toEqual([])
  })

  test('creates invoices that do not exist yet', async () => {
    const parsed = await loadParsed()

    const { created, completed } = await invoiceModel.createMany([parsed])

    expect(created.map((invoice) => invoice.id)).toEqual([parsed.id])
    expect(completed).toEqual([])
  })
})
