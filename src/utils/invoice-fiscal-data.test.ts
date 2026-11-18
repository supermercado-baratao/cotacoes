import { Timestamp } from 'firebase/firestore'
import { describe, expect, test, vi } from 'vitest'

import { database } from '@/infra/database'
import { invoiceModel } from '@/models/invoice/model'
import { type TInvoice, type TInvoiceItem } from '@/models/invoice/types'
import { parseNfe } from '@/pages/invoices/utils'
import { readMockFile } from '@/tests/_utils/read-mock-file'

import {
  completeInvoiceFiscalData,
  hasMissingFiscalData
} from './invoice-fiscal-data'

vi.mock('@/infra/firebase-config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/infra/firebase-config')>()),
  getUserPath: (collection: string) => `users/test/${collection}`
}))

vi.mock('@/infra/database', () => ({
  database: {
    findMany: vi.fn(),
    createManyWithIds: vi.fn(),
    updateMany: vi.fn()
  }
}))

const now = Timestamp.now()

// Nota de bonificação (CFOP 5910) — a mesma usada em entry-cost.test.ts.
const BONUS_XML =
  'quotes/quote-2-2026-04-01-2026-05-31/NFe29260405853741000139550010009557151161245134.xml'

const loadParsed = async () => {
  const file = await readMockFile(BONUS_XML)
  const xml = file.toString('utf8')
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
      for (const field of LEGACY_MISSING_ITEM_FIELDS) delete legacyItem[field]
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
    for (const [index, item] of completed.items.entries()) {
      expect(item).toMatchObject({
        productId: 'p1',
        orderId: `order-${item.itemNumber}`,
        cfop: '5910',
        totalCost: parsed.items[index].totalCost,
        tribUnit: parsed.items[index].tribUnit
      })
    }
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
  const mockDatabase = (existing: TInvoice[]) => {
    vi.mocked(database.findMany).mockResolvedValue(existing)
    vi.mocked(database.createManyWithIds).mockImplementation(({ data }) =>
      Promise.resolve(data)
    )
    vi.mocked(database.updateMany).mockImplementation(({ data }) =>
      Promise.resolve(data)
    )
  }

  test('completes existing invoices missing fiscal data instead of skipping them', async () => {
    const parsed = await loadParsed()
    mockDatabase([toLegacyInvoice(parsed)])

    const { created, completed } = await invoiceModel.createMany([parsed])

    expect(created).toEqual([])
    expect(completed).toHaveLength(1)
    const [stored] = completed
    expect(stored.operationNature).toBe('BONIFICACAO, DOACAO OU BRINDE')
    expect(stored.verificationStatus).toBe('approved')
    expect(stored.items.every((item) => item.cfop === '5910')).toBe(true)
    expect(stored.items.every((item) => item.orderId !== null)).toBe(true)
  })

  test('skips existing invoices that already have the fiscal data', async () => {
    const parsed = await loadParsed()
    mockDatabase([{ ...parsed, createdAt: now, updatedAt: now }])

    const { created, completed } = await invoiceModel.createMany([parsed])

    expect(created).toEqual([])
    expect(completed).toEqual([])
    expect(database.createManyWithIds).not.toHaveBeenCalled()
    expect(database.updateMany).not.toHaveBeenCalled()
  })

  test('creates invoices that do not exist yet', async () => {
    const parsed = await loadParsed()
    mockDatabase([])

    const { created, completed } = await invoiceModel.createMany([parsed])

    expect(created.map((invoice) => invoice.id)).toEqual([parsed.id])
    expect(completed).toEqual([])
  })
})
