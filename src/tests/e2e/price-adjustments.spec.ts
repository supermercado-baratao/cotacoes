import path from 'node:path'

import { expect, type Page, test } from '@playwright/test'
import dayjs from 'dayjs'

import { invoiceModel } from '@/models/invoice/model'
import { orderModel } from '@/models/order/model'
import { priceAdjustmentModel } from '@/models/price-adjustment/model'
import { quoteModel } from '@/models/quote/model'
import { supplierModel } from '@/models/supplier/model'
import { createUser, populateDatabase } from '@/tests/orchestrator'

const MOCKS_DIR = path.join(import.meta.dirname, '../_mocks')
const REAJUSTE_XLSX = 'price-adjustments-small.xlsx'

const login = async (page: Page, email: string, password: string) => {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await page.getByRole('button', { name: 'Reajustes de Preços' }).click()
  await expect(page).toHaveURL(/\/price-adjustments/)
}

const openImportDialog = async (page: Page) => {
  await page.getByRole('button', { name: 'Importar Arquivo' }).click()
  await expect(
    page.getByText('Arraste e solte o arquivo de reajuste aqui')
  ).toBeVisible()
}

const uploadReajusteFile = (page: Page, filename: string) =>
  page
    .locator('input[type="file"]')
    .setInputFiles(path.join(MOCKS_DIR, filename))

// The suppliers/cost cell joins values by data-field, not by isolated text.
const getCellText = async (
  row: import('@playwright/test').Locator,
  field: string
) => row.locator(`[data-field="${field}"]`).innerText()

// Seeds the quotes/orders/invoice needed to give '198954' (AZEITE ANDORINHA, no
// family) a real cost: order A (supplier A, 17.00) and order B (supplier B,
// 16.00) linked to the invoice (unitPrice 15.50, which wins over the order
// price) -> real cost = average(17.00, 15.50).
const seedQuotesOrdersAndInvoice = async () => {
  const oldQuoteItemId = crypto.randomUUID()
  const recentQuoteItemId = crypto.randomUUID()

  const oldQuote = await quoteModel.create({
    items: [
      {
        id: oldQuoteItemId,
        description: 'AZEITE ANDORINHA',
        salePrice: null,
        priceRef: null
      }
    ],
    orders: [],
    status: 'closed',
    date: '2026-01-01',
    observations: null
  })

  const recentQuote = await quoteModel.create({
    items: [
      {
        id: recentQuoteItemId,
        description: 'AZEITE ANDORINHA',
        salePrice: null,
        priceRef: null
      }
    ],
    orders: [],
    status: 'opened',
    date: '2026-06-15',
    observations: null
  })

  const supplierA = await supplierModel.create({
    id: 'supplier-a',
    legalName: 'FORNECEDOR A LTDA',
    tradeName: 'FORNECEDOR A',
    cnpj: '11111111000111',
    email: null,
    phone: null,
    vrCreatedAt: null,
    observations: null
  })

  const supplierB = await supplierModel.create({
    id: 'supplier-b',
    legalName: 'FORNECEDOR B LTDA',
    tradeName: 'FORNECEDOR B',
    cnpj: '22222222000122',
    email: null,
    phone: null,
    vrCreatedAt: null,
    observations: null
  })

  const baseOrder = {
    productId: '198954',
    packing: 'UN',
    packingQuantity: null,
    sellerId: null,
    observations: null,
    quantity: 1
  }

  await orderModel.create({
    ...baseOrder,
    quoteId: oldQuote.id,
    quoteItemId: oldQuoteItemId,
    invoiceId: null,
    price: 15,
    supplierId: supplierA.id,
    date: oldQuote.date
  })

  await orderModel.create({
    ...baseOrder,
    quoteId: recentQuote.id,
    quoteItemId: recentQuoteItemId,
    invoiceId: null,
    price: 17,
    supplierId: supplierA.id,
    date: recentQuote.date
  })

  const invoiceId = crypto.randomUUID()
  const recentOrderB = await orderModel.create({
    ...baseOrder,
    quoteId: recentQuote.id,
    quoteItemId: recentQuoteItemId,
    invoiceId,
    price: 16,
    supplierId: supplierB.id,
    date: recentQuote.date
  })

  await invoiceModel.create({
    id: invoiceId,
    accessKey: 'fake-access-key-198954',
    number: '9500',
    series: '1',
    // The page fetches invoices from the last 30 days (defaultInvoiceDateRange
    // in use-app-store.ts), so the date must be recent, not the fixed quote
    // date.
    emissionDate: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
    supplierCnpj: supplierB.cnpj,
    supplierName: supplierB.tradeName ?? supplierB.legalName,
    destinationCnpj: '99999999000199',
    totalValue: 15.5,
    items: [
      {
        itemNumber: 1,
        supplierProductCode: 'AZ-198954',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'AZEITE ANDORINHA EXTRA VIRGEM 250ML',
        unit: 'UN',
        quantity: 1,
        unitPrice: 15.5,
        totalPrice: 15.5,
        tribUnit: 'UN',
        tribQuantity: 1,
        tribUnitPrice: 15.5,
        productId: '198954',
        orderId: recentOrderB.id,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      }
    ],
    verificationStatus: 'pending',
    quoteId: null
  })
}

test('imports, dedupes by code, cross-references the most recent quote prioritizing the invoice, updates prices and saves the report', async ({
  page
}) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  await populateDatabase()
  await seedQuotesOrdersAndInvoice()
  await login(page, email, password)

  await openImportDialog(page)
  await uploadReajusteFile(page, REAJUSTE_XLSX)

  // CHA LEAO CAMOMILA belongs to the 'CHA LEAO CX' family; "Famílias de Preços"
  // is the default tab, but the group starts collapsed.
  await expect(page.getByText('CHA LEAO CX')).toBeVisible()
  await page.getByText('CHA LEAO CX').click()
  await expect(page.getByText('CHA LEAO CAMOMILA 10UN')).toBeVisible()

  const chaRow = page
    .getByText('CHA LEAO CAMOMILA 10UN')
    .locator('xpath=ancestor::*[@role="row"][1]')
  // Without a recent order/quote, the real cost falls back to the file cost
  // (REP).
  expect(await getCellText(chaRow, 'fileCost')).toContain('R$ 2,56')
  expect(await getCellText(chaRow, 'resolvedCost')).toContain('R$ 2,56')
  await expect(chaRow.getByText('Sem cotação recente')).toBeVisible()

  await page.getByRole('tab', { name: 'Produtos' }).click()
  await expect(
    page.getByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
  ).toBeVisible()

  // '198954' shows up twice in the file (same correction on the same day): only
  // one card is left, with the latest row (21.98, not 99.99).
  await expect(
    page.getByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
  ).toHaveCount(1)
  const azeiteCard = page
    .getByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await expect(azeiteCard.getByText('R$ 23,98')).toBeVisible()
  await expect(azeiteCard.getByText('R$ 21,98')).toBeVisible()
  await expect(azeiteCard.getByText('R$ 99,99')).toHaveCount(0)

  // The "Produtos" tab shows no real cost, divergence or suppliers for a
  // product without a family, so check the stored document.
  await expect
    .poll(
      async () => {
        const adjustments = await priceAdjustmentModel.findMany()
        return adjustments.length
      },
      { timeout: 10_000 }
    )
    .toBe(4)

  const adjustments = await priceAdjustmentModel.findMany()
  const azeite = adjustments.find((p) => p.code === '198954')
  expect(azeite?.movementDate).toBe('2026-06-10')
  // Real cost = average(17.00 from order A, 15.50 from the invoice linked to
  // order B): not 16.89 (file cost) nor 16.00 (order B price, which the invoice
  // overrides).
  expect(azeite?.resolvedCost).toBeCloseTo(16.25)
  expect(azeite?.costDivergence).toBeCloseTo(-0.64)
  expect(azeite?.supplierNames).toEqual(
    expect.arrayContaining(['FORNECEDOR A', 'FORNECEDOR B'])
  )

  // Default period = earliest/latest Data Movimento in the imported report
  // ('198954'/'199770'/'000427' on 06/10, '217636' on 06/11).
  await expect(page.getByLabel('Início do período')).toHaveValue('2026-06-10')
  await expect(page.getByLabel('Fim do período')).toHaveValue('2026-06-11')

  // The import updates the sale price of every registered product in the
  // report, with no confirmation step. '217636' is 5.48 in the catalog and 5.55
  // in the file.
  await page.getByRole('button', { name: 'Produtos' }).click()
  await expect(page).toHaveURL(/\/products/)
  await page
    .getByPlaceholder('Buscar produto...')
    .fill('SALG DORITOS 60G DINAMITA PIMENTA MEXICANA PCT')
  await expect(page.getByText('R$ 5,55')).toBeVisible()

  // Remounts the page with `priceAdjustments` already in the store: the period
  // autofill must fire again, not only when the data first arrives.
  await page.getByRole('button', { name: 'Reajustes de Preços' }).click()
  await expect(page).toHaveURL(/\/price-adjustments/)
  await expect(page.getByLabel('Início do período')).toHaveValue('2026-06-10')
  await expect(page.getByLabel('Fim do período')).toHaveValue('2026-06-11')
})

test('the "Não cadastrado" group starts expanded on the "Sem cadastro" tab', async ({
  page
}) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  await populateDatabase()
  await login(page, email, password)

  await openImportDialog(page)
  await uploadReajusteFile(page, REAJUSTE_XLSX)
  await expect(page.getByText('CHA LEAO CX')).toBeVisible()

  await page.getByRole('tab', { name: 'Sem cadastro' }).click()

  // With no summary box (only family groups have one), the group starts
  // expanded.
  await expect(
    page.getByText('VINAGRE MARATA 750ML VINHO TINTO PET')
  ).toBeVisible()

  const row = page
    .getByText('VINAGRE MARATA 750ML VINHO TINTO PET')
    .locator('xpath=ancestor::*[@role="row"][1]')
  await expect(row.getByText('Não cadastrado')).toBeVisible()
})
