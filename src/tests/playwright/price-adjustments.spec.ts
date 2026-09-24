import path from 'node:path'

import { expect, type Page, test } from '@playwright/test'
import dayjs from 'dayjs'

import {
  invoiceModel,
  orderModel,
  priceAdjustmentModel,
  quoteModel,
  supplierModel
} from '@/models'

import { clearData, createUser, populateDatabase } from './orchestrator'

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

// A célula de fornecedores/custo junta valores por data-field, não texto
// isolado — mesma ideia do teste antigo em vitest.
const getCellText = async (
  row: import('@playwright/test').Locator,
  field: string
) => row.locator(`[data-field="${field}"]`).innerText()

test.beforeAll(async () => {
  await clearData()
})

// Seeda cotações/pedidos/nota necessários pra cruzar '198954' (AZEITE
// ANDORINHA, sem família) com um custo real: pedido A (fornecedor A, 17.00)
// e pedido B (fornecedor B, 16.00) vinculado à nota (unitPrice 15.50, que
// prevalece sobre o preço do pedido) -> custo real = média(17.00, 15.50).
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
    // A tela busca notas dos últimos 30 dias a partir de "hoje" (ver
    // defaultInvoiceDateRange em use-app-store.ts) — precisa ser uma data
    // recente, não a data fixa da cotação, pra sempre cair dentro da janela.
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
  test.setTimeout(60000)
  const { email, password } = await createUser()
  await populateDatabase()
  await seedQuotesOrdersAndInvoice()
  await login(page, email, password)

  await openImportDialog(page)
  await uploadReajusteFile(page, REAJUSTE_XLSX)

  // CHA LEAO CAMOMILA pertence à família 'CHA LEAO CX' — a aba "Famílias de
  // Preços" é a padrão, mas o grupo começa retraído.
  await expect(page.getByText('CHA LEAO CX')).toBeVisible()
  await page.getByText('CHA LEAO CX').click()
  await expect(page.getByText('CHA LEAO CAMOMILA 10UN')).toBeVisible()

  const chaRow = page
    .getByText('CHA LEAO CAMOMILA 10UN')
    .locator('xpath=ancestor::*[@role="row"][1]')
  // Sem pedido/cotação recente, o custo real cai no custo do arquivo (REP).
  expect(await getCellText(chaRow, 'fileCost')).toContain('R$ 2,56')
  expect(await getCellText(chaRow, 'resolvedCost')).toContain('R$ 2,56')
  await expect(chaRow.getByText('Sem cotação recente')).toBeVisible()

  // AZEITE ANDORINHA não tem família — fica na aba "Produtos", como card.
  await page.getByRole('tab', { name: 'Produtos' }).click()
  await expect(
    page.getByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
  ).toBeVisible()

  // '198954' aparece 2x no arquivo (mesma correção no mesmo dia) — só um
  // card deve sobrar, com os dados da linha mais recente (21.98, não 99.99).
  await expect(
    page.getByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
  ).toHaveCount(1)
  const azeiteCard = page
    .getByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await expect(azeiteCard.getByText('R$ 21,98')).toHaveCount(2)

  // A coleção price-adjustments guarda o relatório inteiro. Custo real,
  // divergência e fornecedores não aparecem na aba "Produtos" (sem
  // DataGrid) pra um produto sem família — confirmados direto no documento
  // persistido (mesmo pipeline real, só que sem UI pra esse campo).
  await expect
    .poll(
      async () => {
        const adjustments = await priceAdjustmentModel.findMany()
        return adjustments.length
      },
      { timeout: 10000 }
    )
    .toBe(4)

  const adjustments = await priceAdjustmentModel.findMany()
  const azeite = adjustments.find((p) => p.code === '198954')
  expect(azeite?.movementDate).toBe('2026-06-10')
  // Custo real = média(17.00 do pedido A, 15.50 da nota vinculada ao pedido
  // B) — não 16.89 (custo do arquivo) nem 16.00 (preço do pedido B, que a
  // nota vence).
  expect(azeite?.resolvedCost).toBeCloseTo(16.25)
  expect(azeite?.costDivergence).toBeCloseTo(-0.64)
  expect(azeite?.supplierNames).toEqual(
    expect.arrayContaining(['FORNECEDOR A', 'FORNECEDOR B'])
  )

  // Período padrão = menor/maior Data Movimento do relatório importado
  // ('198954'/'199770'/'000427' em 10/06, '217636' em 11/06).
  await expect(page.getByLabel('Início do período')).toHaveValue('2026-06-10')
  await expect(page.getByLabel('Fim do período')).toHaveValue('2026-06-11')

  // O import atualiza direto o preço de venda de todo produto do relatório
  // já cadastrado, sem etapa de confirmação. '217636' tem 5.48 no catálogo e
  // 5.55 no arquivo de reajuste — verificado na tela de Produtos.
  await page.getByRole('button', { name: 'Produtos' }).click()
  await expect(page).toHaveURL(/\/products/)
  await page
    .getByPlaceholder('Buscar produto...')
    .fill('SALG DORITOS 60G DINAMITA PIMENTA MEXICANA PCT')
  await expect(page.getByText('R$ 5,55')).toBeVisible()

  // Remonta a página com `priceAdjustments` já carregado no store (a busca
  // global resolveu na primeira visita) — o preenchimento automático do
  // período precisa disparar de novo nesse caso, não só na primeira vez que
  // os dados chegam.
  await page.getByRole('button', { name: 'Reajustes de Preços' }).click()
  await expect(page).toHaveURL(/\/price-adjustments/)
  await expect(page.getByLabel('Início do período')).toHaveValue('2026-06-10')
  await expect(page.getByLabel('Fim do período')).toHaveValue('2026-06-11')
})

test('the "Não cadastrado" group starts expanded on the "Sem cadastro" tab', async ({
  page
}) => {
  test.setTimeout(60000)
  const { email, password } = await createUser()
  await populateDatabase()
  await login(page, email, password)

  await openImportDialog(page)
  await uploadReajusteFile(page, REAJUSTE_XLSX)
  await expect(page.getByText('CHA LEAO CX')).toBeVisible()

  await page.getByRole('tab', { name: 'Sem cadastro' }).click()

  // Sem quadro-resumo pra compensar (só existe pra grupos de família), o
  // grupo já vem expandido.
  await expect(
    page.getByText('VINAGRE MARATA 750ML VINHO TINTO PET')
  ).toBeVisible()

  const row = page
    .getByText('VINAGRE MARATA 750ML VINHO TINTO PET')
    .locator('xpath=ancestor::*[@role="row"][1]')
  await expect(row.getByText('Não cadastrado')).toBeVisible()
})
