import { expect, type Locator, type Page, test } from '@playwright/test'
import dayjs from 'dayjs'

import { invoiceModel } from '@/models/invoice/model'
import type { TInvoice, TInvoiceItem } from '@/models/invoice/types'
import { productModel } from '@/models/product/model'
import type { TProduct } from '@/models/product/types'
import { quoteModel } from '@/models/quote/model'
import type { TQuote } from '@/models/quote/types'
import { settingsModel } from '@/models/settings/model'
import { supplierModel } from '@/models/supplier/model'
import { createUser } from '@/tests/orchestrator'

const makeProduct = (
  overrides: Partial<TProduct> & { id: string; description: string }
): Omit<TProduct, 'createdAt' | 'updatedAt'> => ({
  price: 100,
  barcodes: [],
  packTypes: [],
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
  vrCreatedAt: '2026-01-01',
  ...overrides
})

const makeQuote = (
  overrides: Partial<TQuote>
): Omit<TQuote, 'id' | 'createdAt' | 'updatedAt'> => ({
  items: [],
  orders: [],
  status: 'opened',
  date: '2026-01-01',
  observations: null,
  ...overrides
})

// The page fetches invoices from the last 30 days (defaultInvoiceDateRange in
// use-app-store.ts), so the date must be recent, not fixed.
const RECENT_EMISSION_DATE = dayjs().format('YYYY-MM-DD')

const makeInvoice = (
  overrides: Partial<TInvoice> & { id: string }
): Omit<TInvoice, 'createdAt' | 'updatedAt'> => ({
  accessKey: overrides.id,
  number: overrides.id,
  series: '1',
  emissionDate: RECENT_EMISSION_DATE,
  supplierCnpj: '11111111000111',
  supplierName: 'FORNECEDOR',
  destinationCnpj: '22222222000122',
  totalValue: 0,
  items: [],
  verificationStatus: 'pending',
  quoteId: null,
  ...overrides
})

const makeInvoiceItem = (
  overrides: Partial<TInvoiceItem> = {}
): TInvoiceItem => ({
  itemNumber: 1,
  supplierProductCode: '1',
  barcode: null,
  calculatedBarcode: null,
  packageBarcode: null,
  description: 'item',
  unit: 'UN',
  quantity: 1,
  unitPrice: 10,
  totalPrice: 10,
  tribUnit: 'UN',
  tribQuantity: 1,
  tribUnitPrice: 10,
  productId: null,
  orderId: null,
  matchStatus: 'matched',
  priceDivergence: null,
  quantityDivergence: null,
  ...overrides
})

const daysAgo = (days: number) =>
  dayjs().subtract(days, 'day').format('YYYY-MM-DD')

const getRow = (page: Page, description: string): Locator =>
  page
    .getByText(description, { exact: true })
    .locator('xpath=ancestor::*[@role="row"][1]')

test('shows aggregate stats and flags products outside the configured margin range', async ({
  page
}) => {
  const { email, password } = await createUser()

  await settingsModel.upsert({ marginTolerance: { below: 25, above: 35 } })

  // 5 products, only 2 with a known cost, and only 1 of them sells below the
  // minimum margin.
  await Promise.all([
    // price 100, cost 80 -> actual margin 20%; floor 25% -> below
    productModel.create(
      makeProduct({
        id: 'p1',
        description: 'PRODUTO ABAIXO',
        costWithTax: 80
      })
    ),
    // price 100, cost 50 -> actual margin 50%; ceiling 35% -> above
    productModel.create(
      makeProduct({
        id: 'p2',
        description: 'PRODUTO ACIMA',
        costWithTax: 50
      })
    ),
    productModel.create(
      makeProduct({ id: 'p3', description: 'PRODUTO SEM CUSTO APURADO' })
    ),
    productModel.create(
      makeProduct({ id: 'p4', description: 'PRODUTO SEM CUSTO APURADO 2' })
    ),
    productModel.create(
      makeProduct({ id: 'p5', description: 'PRODUTO SEM CUSTO APURADO 3' })
    ),
    // 3 open quotes, 1 closed
    quoteModel.create(makeQuote({ status: 'opened' })),
    quoteModel.create(makeQuote({ status: 'opened' })),
    quoteModel.create(makeQuote({ status: 'opened' })),
    quoteModel.create(makeQuote({ status: 'closed' })),
    // 2 pending invoices, 1 approved
    invoiceModel.create(
      makeInvoice({ id: 'i1', verificationStatus: 'pending' })
    ),
    invoiceModel.create(
      makeInvoice({ id: 'i2', verificationStatus: 'pending' })
    ),
    invoiceModel.create(
      makeInvoice({ id: 'i3', verificationStatus: 'approved' })
    )
  ])

  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Turns the period filter off so the totals do not depend on invoices linked
  // to these products (the period is covered by the test below).
  await page
    .getByRole('switch', { name: 'Filtrar por entrada no período' })
    .uncheck()

  const productsCard = page.getByText('Produtos cadastrados').locator('..')
  await expect(productsCard.getByText('5', { exact: true })).toBeVisible()

  const quotesCard = page.getByText('Cotações abertas').locator('..')
  await expect(quotesCard.getByText('3', { exact: true })).toBeVisible()

  const invoicesCard = page
    .getByText('Notas pendentes de verificação')
    .locator('..')
  await expect(invoicesCard.getByText('2', { exact: true })).toBeVisible()

  // Each label shows up twice, as the card label and as the table section
  // title; the card comes first in the DOM.
  const belowMarginCard = page
    .getByText('Produtos abaixo da margem')
    .first()
    .locator('..')
  await expect(belowMarginCard.getByText('1', { exact: true })).toBeVisible()

  const aboveMarginCard = page
    .getByText('Produtos acima da margem')
    .first()
    .locator('..')
  await expect(aboveMarginCard.getByText('1', { exact: true })).toBeVisible()

  await expect(page.getByText('PRODUTO ABAIXO')).toBeVisible()

  const belowMarginSection = page
    .getByText('Produtos abaixo da margem')
    .last()
    .locator('..')
  await expect(belowMarginSection.getByText('PRODUTO ACIMA')).not.toBeVisible()

  const aboveMarginSection = page
    .getByText('Produtos acima da margem')
    .last()
    .locator('..')
  await expect(aboveMarginSection.getByText('PRODUTO ACIMA')).toBeVisible()
})

test('filters margin alerts by presence in an invoice within the selected period, with an option to disable the filter', async ({
  page
}) => {
  const { email, password } = await createUser()

  await settingsModel.upsert({ marginTolerance: { below: 25, above: 100 } })

  // All below the margin (floor 25%): price 100, cost 80 -> margin 20%. The
  // invoices carry the same cost as the VR (80), since the invoice average for
  // the period wins over the VR cost.
  await Promise.all([
    productModel.create(
      makeProduct({
        id: 'p1',
        description: 'ENTRADA RECENTE',
        costWithTax: 80
      })
    ),
    productModel.create(
      makeProduct({ id: 'p2', description: 'ENTRADA ANTIGA', costWithTax: 80 })
    ),
    productModel.create(
      makeProduct({ id: 'p3', description: 'SEM ENTRADA', costWithTax: 80 })
    ),
    invoiceModel.create(
      makeInvoice({
        id: 'i1',
        emissionDate: daysAgo(10),
        items: [
          makeInvoiceItem({ productId: 'p1', unitPrice: 80, totalPrice: 80 })
        ]
      })
    ),
    invoiceModel.create(
      makeInvoice({
        id: 'i2',
        emissionDate: daysAgo(60),
        items: [
          makeInvoiceItem({ productId: 'p2', unitPrice: 80, totalPrice: 80 })
        ]
      })
    )
  ])

  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  // Period filter on by default (last 30 days): only ENTRADA RECENTE has an
  // invoice within the period that is already loaded. ENTRADA ANTIGA (invoice
  // from 60 days ago, not loaded yet, since the Invoices page is also limited
  // to 30 days) and SEM ENTRADA (no linked invoice) disappear.
  await expect(page.getByText('ENTRADA RECENTE')).toBeVisible()
  await expect(page.getByText('ENTRADA ANTIGA')).not.toBeVisible()
  await expect(page.getByText('SEM ENTRADA')).not.toBeVisible()

  await page.getByRole('button', { name: 'Notas de Entrada' }).click()
  await expect(page).toHaveURL(/\/invoices/)
  await page.getByLabel('De', { exact: true }).fill(daysAgo(70))
  await page.getByRole('button', { name: 'Buscar' }).click()
  await page.getByPlaceholder('Buscar por NF, fornecedor ou item...').fill('i2')
  await expect(page.getByText('i2', { exact: true })).toBeVisible({
    timeout: 10_000
  })

  // The invoice is loaded now, but ENTRADA ANTIGA still disappears: the
  // Dashboard's own period is still the last 30 days.
  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText('ENTRADA ANTIGA')).not.toBeVisible()

  await page.getByLabel('Início do período').fill(daysAgo(70))
  await expect(page.getByText('ENTRADA RECENTE')).toBeVisible()
  await expect(page.getByText('ENTRADA ANTIGA')).toBeVisible()
  await expect(page.getByText('SEM ENTRADA')).not.toBeVisible()

  await page
    .getByRole('switch', { name: 'Filtrar por entrada no período' })
    .uncheck()
  await expect(page.getByText('SEM ENTRADA')).toBeVisible()
})

test('opens a drawer with the invoices where a flagged product had an entry within the period', async ({
  page
}) => {
  const { email, password } = await createUser()

  await settingsModel.upsert({ marginTolerance: { below: 25, above: 100 } })

  // price 100, cost 80 (VR and invoice) -> margin 20%; floor 25% -> below
  await Promise.all([
    productModel.create(
      makeProduct({
        id: 'p1',
        description: 'PRODUTO COM NOTA',
        costWithTax: 80
      })
    ),
    invoiceModel.create(
      makeInvoice({
        id: 'i1',
        emissionDate: daysAgo(5),
        items: [
          makeInvoiceItem({
            productId: 'p1',
            quantity: 3,
            unitPrice: 80,
            totalPrice: 240
          })
        ]
      })
    )
  ])

  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  await expect(page.getByText('PRODUTO COM NOTA')).toBeVisible()

  await getRow(page, 'PRODUTO COM NOTA')
    .getByRole('button', { name: 'Ver notas' })
    .click()

  await expect(
    page.getByRole('cell', { name: 'i1', exact: true })
  ).toBeVisible()
  await expect(page.getByRole('cell', { name: 'FORNECEDOR' })).toBeVisible()
})

test('prioritizes the VR cost, flagging bonus and divergence from the entry cost with VR packing', async ({
  page
}) => {
  const { email, password } = await createUser()

  await settingsModel.upsert({ marginTolerance: { below: 60, above: 100 } })

  // The margin uses the VR cost (10) -> 50%, below the 60% floor. From the
  // invoices: 2 CX of 12 units each (the VR packing for the supplier's code) at
  // 216.00 = 432.00 paid, plus 6 bonus units (CFOP 5910) whose value is ignored
  // -> 432 / (24 + 6) = 14.40 per unit, +44% off the VR -> attention.
  await Promise.all([
    productModel.create({
      ...makeProduct({
        id: 'p1',
        description: 'PRODUTO BONIFICADO',
        price: 20,
        costWithTax: 10
      }),
      supplierPackings: [
        { supplierId: 's1', supplierProductCode: 'CX12', packQuantity: 12 }
      ]
    }),
    invoiceModel.create(
      makeInvoice({
        id: 'venda',
        emissionDate: daysAgo(5),
        operationNature: 'VENDA DE MERCADORIA',
        items: [
          makeInvoiceItem({
            productId: 'p1',
            supplierProductCode: 'CX12',
            unit: 'CX',
            quantity: 2,
            unitPrice: 216,
            // Taxable unit equal to the commercial one (same unit price), so
            // the conversion falls back to the VR packing.
            tribUnit: 'CX',
            tribQuantity: 2,
            tribUnitPrice: 216,
            totalPrice: 432,
            cfop: '5102',
            totalCost: 432
          })
        ]
      })
    ),
    invoiceModel.create(
      makeInvoice({
        id: 'bonificacao',
        emissionDate: daysAgo(5),
        operationNature: 'BONIFICACAO, DOACAO OU BRINDE',
        items: [
          makeInvoiceItem({
            productId: 'p1',
            supplierProductCode: 'UN',
            quantity: 6,
            unitPrice: 18,
            totalPrice: 108,
            cfop: '5910',
            totalCost: 108
          })
        ]
      })
    )
  ])
  await supplierModel.create({
    id: 's1',
    legalName: 'FORNECEDOR',
    tradeName: 'FORNECEDOR',
    cnpj: '11111111000111',
    email: null,
    phone: null,
    observations: null,
    vrCreatedAt: '2020-01-01'
  })

  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  // The description cell also has the "Bonificação" badge, so the exact product
  // text is not enough to find the row.
  const row = page.getByRole('row').filter({ hasText: 'PRODUTO BONIFICADO' })
  await expect(row).toBeVisible()
  await expect(row.getByText('Bonificação')).toBeVisible()
  await expect(row.getByText('R$ 10,00')).toBeVisible()
  await expect(row.getByLabel('Atenção: custo divergente do VR')).toBeVisible()

  await row.getByRole('button', { name: 'Ver notas' }).click()
  const drawer = page.getByRole('presentation')
  await expect(drawer.getByText('× 12')).toBeVisible()
  await expect(
    drawer.getByRole('cell', { name: '24', exact: true })
  ).toBeVisible()
  await expect(drawer.getByText('R$ 18,00')).toHaveCount(2)
  await expect(drawer.getByText('Bonificação')).toBeVisible()
})

test('recalculates the margin with the cost source selected in the cost column', async ({
  page
}) => {
  const { email, password } = await createUser()

  await settingsModel.upsert({ marginTolerance: { below: 25, above: 38 } })

  // Price 100. VR 80 -> margin 20% (below the 25% floor). Invoices: 70 and 60
  // -> average 65 -> 35% (within range); last invoice 60 -> 40% (above the 38%
  // ceiling).
  await Promise.all([
    productModel.create(
      makeProduct({ id: 'p1', description: 'PRODUTO CUSTO', costWithTax: 80 })
    ),
    invoiceModel.create(
      makeInvoice({
        id: 'nf-antiga',
        emissionDate: daysAgo(10),
        items: [
          makeInvoiceItem({ productId: 'p1', unitPrice: 70, totalPrice: 70 })
        ]
      })
    ),
    invoiceModel.create(
      makeInvoice({
        id: 'nf-recente',
        emissionDate: daysAgo(5),
        items: [
          makeInvoiceItem({ productId: 'p1', unitPrice: 60, totalPrice: 60 })
        ]
      })
    )
  ])

  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  const belowMarginSection = page
    .getByText('Produtos abaixo da margem')
    .last()
    .locator('..')
  const aboveMarginSection = page
    .getByText('Produtos acima da margem')
    .last()
    .locator('..')
  const belowMarginCard = page
    .getByText('Produtos abaixo da margem')
    .first()
    .locator('..')

  const row = getRow(page, 'PRODUTO CUSTO')
  await expect(row.getByText('R$ 80,00')).toBeVisible()
  await expect(row.getByText('20.0%')).toBeVisible()

  const costSelect = page.getByRole('combobox', {
    name: 'Fonte do custo de PRODUTO CUSTO'
  })
  await costSelect.click()

  const vrOption = page.getByRole('option', {
    name: /Custo c\/ Imposto \(VR\)/
  })
  await expect(vrOption).toContainText('Padrão')
  await expect(vrOption).toContainText('R$ 80,00')
  await expect(vrOption).toContainText('custocomimposto')

  const entriesOption = page.getByRole('option', {
    name: /Custo médio das NFs/
  })
  await expect(entriesOption).toContainText('R$ 65,00')
  await expect(entriesOption).toContainText(
    '2 entradas pagas · 2 un. · notas do período'
  )

  const lastEntryOption = page.getByRole('option', { name: /Última NF paga/ })
  await expect(lastEntryOption).toContainText('R$ 60,00')
  await expect(lastEntryOption).toContainText('NF nf-recente · FORNECEDOR')

  await entriesOption.click()
  await expect(row.getByText('R$ 65,00')).toBeVisible()
  await expect(row.getByText('35.0%')).toBeVisible()
  await expect(row.getByText('Dentro da margem')).toBeVisible()
  await expect(belowMarginCard.getByText('0', { exact: true })).toBeVisible()

  await costSelect.click()
  await page.getByRole('option', { name: /Última NF paga/ }).click()
  await expect(
    aboveMarginSection.getByText('PRODUTO CUSTO', { exact: true })
  ).toBeVisible()
  await expect(
    belowMarginSection.getByText('PRODUTO CUSTO', { exact: true })
  ).not.toBeVisible()
  await expect(getRow(page, 'PRODUTO CUSTO').getByText('40.0%')).toBeVisible()

  await page.reload()
  await expect(
    aboveMarginSection.getByText('PRODUTO CUSTO', { exact: true })
  ).toBeVisible()
  await expect(
    getRow(page, 'PRODUTO CUSTO').getByText('R$ 60,00')
  ).toBeVisible()
  await expect(getRow(page, 'PRODUTO CUSTO').getByText('40.0%')).toBeVisible()

  await costSelect.click()
  await page.getByRole('option', { name: /Custo c\/ Imposto \(VR\)/ }).click()
  await expect(
    belowMarginSection.getByText('PRODUTO CUSTO', { exact: true })
  ).toBeVisible()
  await expect(getRow(page, 'PRODUTO CUSTO').getByText('20.0%')).toBeVisible()
  await page.reload()
  await expect(getRow(page, 'PRODUTO CUSTO').getByText('20.0%')).toBeVisible()
})

test('uses the cost with the packing corrected in the invoice detail as the default margin cost', async ({
  page
}) => {
  const { email, password } = await createUser()

  await settingsModel.upsert({ marginTolerance: { below: 25, above: 35 } })

  // Price 10. VR 9 -> margin 10%, below the 25% floor. The invoice has 2 CX at
  // 69.00 with no pack quantity and no VR packing (taken as 1). Corrected to 10
  // units: 138 / 20 = 6.90 -> 31%, within range.
  await Promise.all([
    productModel.create(
      makeProduct({
        id: 'p1',
        description: 'PRODUTO EMBALAGEM',
        price: 10,
        costWithTax: 9
      })
    ),
    invoiceModel.create(
      makeInvoice({
        id: 'nf-cx',
        emissionDate: daysAgo(5),
        items: [
          makeInvoiceItem({
            productId: 'p1',
            description: 'ITEM EM CAIXA',
            unit: 'CX',
            quantity: 2,
            unitPrice: 69,
            tribUnit: 'CX',
            tribQuantity: 2,
            tribUnitPrice: 69,
            totalPrice: 138,
            cfop: '5102',
            totalCost: 138
          })
        ]
      })
    ),
    supplierModel.create({
      id: 's1',
      legalName: 'FORNECEDOR',
      tradeName: 'FORNECEDOR',
      cnpj: '11111111000111',
      email: null,
      phone: null,
      observations: null,
      vrCreatedAt: '2020-01-01'
    })
  ])

  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  await expect(getRow(page, 'PRODUTO EMBALAGEM')).toBeVisible()
  await getRow(page, 'PRODUTO EMBALAGEM')
    .getByRole('button', { name: 'Ver notas' })
    .click()
  await page.getByRole('link', { name: 'Ver nota fiscal' }).click()
  await expect(page).toHaveURL(/\/invoices\/nf-cx/)

  const itemRow = page.getByRole('row').filter({ hasText: 'ITEM EM CAIXA' })
  await expect(itemRow.getByText('R$ 69,00').first()).toBeVisible()
  await itemRow
    .getByRole('button', { name: 'Corrigir Qtd. Embalagem de ITEM EM CAIXA' })
    .click()

  const dialog = page
    .getByRole('presentation')
    .filter({ hasText: 'Corrigir Qtd. Embalagem' })
  await dialog.getByLabel('Qtd. Embalagem corrigida').fill('10')
  await expect(dialog.getByText('R$ 6,90')).toBeVisible()
  await dialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(dialog).toBeHidden()

  await expect(
    itemRow.getByRole('gridcell', {
      name: '10 Corrigir Qtd. Embalagem'
    })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('PRODUTO EMBALAGEM')).toBeHidden()
})
