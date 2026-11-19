import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import dayjs from 'dayjs'
import { deleteApp, getApps } from 'firebase/app'
import { JSDOM } from 'jsdom'

import { invoiceModel } from '@/models/invoice/model'
import { productModel } from '@/models/product/model'
import { quoteModel } from '@/models/quote/model'
import type { TQuoteStatus } from '@/models/quote/types'
import { settingsModel } from '@/models/settings/model'
import { parseNfe } from '@/pages/invoices/utils'
import { createUser, populateDatabase } from '@/tests/orchestrator'

const QUOTES_DIR = path.join(import.meta.dirname, '_mocks', 'quotes')
const QUOTE_DIRECTORY_PATTERN = /^quote-\d+-(\d{4}-\d{2}-\d{2})-/
const MARGIN_TOLERANCE = { below: 20, above: 40 }

// parseNfe relies on the browser DOMParser, which Node lacks
// eslint-disable-next-line unicorn/no-global-object-property-assignment
globalThis.DOMParser = new JSDOM().window.DOMParser

const readQuoteItems = (quoteDirectory: string) =>
  fs
    .readFileSync(path.join(quoteDirectory, 'quote.txt'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((description) => ({
      id: randomUUID(),
      description,
      salePrice: null,
      priceRef: null
    }))

const readInvoiceXmls = (quoteDirectory: string): string[] =>
  fs
    .readdirSync(quoteDirectory)
    .filter((file) => file.endsWith('.xml'))
    .map((file) => fs.readFileSync(path.join(quoteDirectory, file), 'utf8'))

const shiftDate = (date: string, days: number): string =>
  dayjs(date.slice(0, 10)).add(days, 'day').format('YYYY-MM-DD') +
  date.slice(10)

// The fixtures are from mid-2026, but the app only loads invoices from the
// last 30 days: shifting every date keeps them visible without changing the
// gaps between quotes and invoices.
const seedQuotesAndInvoices = async (): Promise<void> => {
  const quoteDirectories = fs
    .readdirSync(QUOTES_DIR)
    .toSorted((first, second) => first.localeCompare(second))
  const lastQuoteDirectory = path.join(QUOTES_DIR, quoteDirectories.at(-1)!)

  const products = await productModel.findMany()
  const invoices = readInvoiceXmls(lastQuoteDirectory).map((xml) =>
    parseNfe(xml, products)
  )
  const lastEmissionDate = invoices
    .map((invoice) => invoice.emissionDate.slice(0, 10))
    .toSorted((first, second) => first.localeCompare(second))
    .at(-1)!
  const shiftDays = dayjs().startOf('day').diff(lastEmissionDate, 'day')

  await Promise.all([
    ...quoteDirectories.map((quoteDirectory, index) => {
      const status: TQuoteStatus =
        index === quoteDirectories.length - 1 ? 'opened' : 'closed'
      return quoteModel.create({
        date: shiftDate(
          QUOTE_DIRECTORY_PATTERN.exec(quoteDirectory)![1],
          shiftDays
        ),
        items: readQuoteItems(path.join(QUOTES_DIR, quoteDirectory)),
        orders: [],
        status,
        observations: null
      })
    }),
    invoiceModel.createMany(
      invoices.map((invoice) => ({
        ...invoice,
        emissionDate: shiftDate(invoice.emissionDate, shiftDays)
      }))
    ),
    settingsModel.upsert({ marginTolerance: MARGIN_TOLERANCE })
  ])
}

export const seed = async (): Promise<{ email: string; password: string }> => {
  const { email, password } = await createUser()
  await populateDatabase()
  await seedQuotesAndInvoices()
  // Open Firebase connections would keep the Node process alive
  await Promise.all(getApps().map((app) => deleteApp(app)))
  return { email, password }
}
