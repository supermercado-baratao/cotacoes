import fs from 'node:fs'
import path from 'node:path'

import { expect, type Locator, type Page, test } from '@playwright/test'

import { orderModel } from '@/models/order/model'
import type { TOrder } from '@/models/order/types'
import { quoteModel } from '@/models/quote/model'
import type { TQuoteItem } from '@/models/quote/types'
import { createUser, populateDatabase } from '@/tests/orchestrator'

const MOCKS_DIR = path.join(import.meta.dirname, '../_mocks')

const shortageList = fs
  .readFileSync(path.join(MOCKS_DIR, 'quote-items.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

const QUOTE_DATE = '2026-02-01'

const login = async (page: Page, email: string, password: string) => {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await page.getByRole('button', { name: 'Cotações' }).click()
  await expect(page).toHaveURL(/\/quotes/)
}

const getRow = (page: Page, description: string): Locator =>
  page
    .getByText(description, { exact: true })
    .locator('xpath=ancestor::*[@role="row"][1]')

const makeShortageItems = (): TQuoteItem[] =>
  shortageList.map((description) => ({
    id: crypto.randomUUID(),
    description,
    salePrice: null,
    priceRef: null
  }))

const seedOrder = (
  quoteId: string,
  quoteItemId: string,
  overrides: Partial<TOrder> = {}
) =>
  orderModel.create({
    quoteId,
    quoteItemId,
    productId: '207826',
    invoiceId: null,
    price: 10,
    quantity: 1,
    packing: 'UN',
    packingQuantity: null,
    supplierId: 'fake-supplier-id',
    sellerId: null,
    date: QUOTE_DATE,
    observations: null,
    ...overrides
  })

test('creates a quote from the full shortage list', async ({ page }) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  await populateDatabase()
  await login(page, email, password)

  await page.getByRole('button', { name: 'Nova Cotação' }).click()
  await page.getByLabel('Data').fill(QUOTE_DATE)
  await page.getByLabel('Lista de faltas').fill(shortageList.join('\n'))
  await page.getByRole('button', { name: 'Salvar' }).click()

  await expect(page.getByText('Cotação criada com sucesso!')).toBeVisible({
    timeout: 15_000
  })
  await expect(page.getByText('PUDIM BRETZKE')).toBeVisible()
  await expect(page.getByText('SABAO EM PO BRILHANTE 2,4KG')).toBeVisible()

  await expect
    .poll(async () => {
      const quotes = await quoteModel.findMany()
      return quotes.find((q) => q.date === QUOTE_DATE)?.items.length
    })
    .toBe(shortageList.length)
})

test('references an item manually and the rest via AI, preserving the manual reference', async ({
  page
}) => {
  // The AI suggestion alone waits DEV_SIMULATED_DELAY_MS (30s) outside production
  test.setTimeout(90_000)
  const { email, password } = await createUser()
  await populateDatabase()
  const quote = await quoteModel.create({
    items: makeShortageItems(),
    orders: [],
    status: 'opened',
    date: QUOTE_DATE,
    observations: null
  })
  await login(page, email, password)

  await expect(page.getByText('PUDIM BRETZKE', { exact: true })).toBeVisible()

  await getRow(page, 'PUDIM BRETZKE')
    .getByRole('button', { name: 'Referenciar' })
    .click()

  const productInput = page.getByLabel('Produto específico')
  await productInput.fill('PUDIM BRETZKE 50G CHOCOLATE')
  await page
    .getByRole('option', { name: 'PUDIM BRETZKE 50G CHOCOLATE' })
    .click()

  const priceInput = page.getByLabel('Preço na cotação')
  await expect(priceInput).toHaveValue('3,15')
  await priceInput.click()
  await priceInput.press('Control+A')
  await priceInput.pressSequentially('5,00')
  await expect(priceInput).toHaveValue('5,00')

  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Cotação atualizada com sucesso!')).toBeVisible()

  await page.getByRole('button', { name: 'Referenciar com IA' }).click()
  await expect(
    page.getByRole('button', { name: /Aplicar \d+ aceitos/ })
  ).toBeVisible({ timeout: 60_000 })

  const aiModal = page
    .getByText('Sugestões da IA')
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await expect(aiModal.getByText('PUDIM BRETZKE 50G CHOCOLATE')).toBeVisible()
  await expect(page.getByText('SAB EM PO BRILHANTE 2,4KG SH')).toBeVisible()
  await expect(
    page.getByText('SH CLEAR 200ML ANTICASPA MEN CAB NER. A SECOS')
  ).toBeVisible()

  await page.getByRole('button', { name: 'Aplicar 29 aceitos' }).click()
  await expect(page.getByText('Cotação atualizada com sucesso!')).toBeVisible()

  await expect
    .poll(async () => {
      const quotes = await quoteModel.findMany()
      const updated = quotes.find((q) => q.id === quote.id)
      return updated?.items.filter((item) => item.priceRef !== null).length
    })
    .toBe(30)

  const quotes = await quoteModel.findMany()
  const updated = quotes.find((q) => q.id === quote.id)
  const manual = updated?.items.find(
    (item) => item.description === 'PUDIM BRETZKE'
  )
  expect(manual?.priceRef).toEqual({ type: 'product', id: '207826' })
  expect(manual?.salePrice).toBe(5)
})

test('edits the shortage list preserving existing references', async ({
  page
}) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  await populateDatabase()

  const referencedItemId = crypto.randomUUID()
  const toRemoveItemId = crypto.randomUUID()
  const quote = await quoteModel.create({
    items: [
      {
        id: referencedItemId,
        description: 'PUDIM BRETZKE',
        salePrice: 5,
        priceRef: { type: 'product', id: '207826' }
      },
      {
        id: toRemoveItemId,
        description: 'DETERGENTE LIMPOL',
        salePrice: null,
        priceRef: null
      }
    ],
    orders: [],
    status: 'opened',
    date: QUOTE_DATE,
    observations: null
  })
  await login(page, email, password)

  await expect(page.getByText('PUDIM BRETZKE', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByLabel('Data').waitFor()
  await page
    .getByLabel('Lista de faltas')
    .fill(['PUDIM BRETZKE', 'NOVO ITEM TESTE'].join('\n'))
  await page.getByRole('button', { name: 'Salvar' }).click()

  await expect(page.getByText('Cotação atualizada com sucesso!')).toBeVisible()
  await expect(page.getByText('NOVO ITEM TESTE')).toBeVisible()
  await expect(page.getByText('DETERGENTE LIMPOL')).not.toBeVisible()

  const quotes = await quoteModel.findMany()
  const updated = quotes.find((q) => q.id === quote.id)
  expect(updated?.items).toHaveLength(2)

  const preserved = updated?.items.find(
    (item) => item.description === 'PUDIM BRETZKE'
  )
  expect(preserved?.priceRef).toEqual({ type: 'product', id: '207826' })
  expect(preserved?.salePrice).toBe(5)

  const created = updated?.items.find(
    (item) => item.description === 'NOVO ITEM TESTE'
  )
  expect(created?.priceRef).toBeNull()
  expect(created?.salePrice).toBeNull()
})

test('removes an item from the quote and deletes its linked orphan order', async ({
  page
}) => {
  const { email, password } = await createUser()
  await populateDatabase()

  const itemToRemoveId = crypto.randomUUID()
  const otherItemId = crypto.randomUUID()
  const quote = await quoteModel.create({
    items: [
      {
        id: itemToRemoveId,
        description: 'POLVILHO AZEDO',
        salePrice: null,
        priceRef: null
      },
      {
        id: otherItemId,
        description: 'OUTRO ITEM',
        salePrice: null,
        priceRef: null
      }
    ],
    orders: [],
    status: 'opened',
    date: QUOTE_DATE,
    observations: null
  })
  const orphanOrder = await seedOrder(quote.id, itemToRemoveId)
  const unrelatedOrder = await seedOrder(quote.id, otherItemId)

  await login(page, email, password)
  await expect(page.getByText('POLVILHO AZEDO')).toBeVisible()

  await getRow(page, 'POLVILHO AZEDO')
    .getByRole('button', { name: 'Excluir' })
    .click()

  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Excluir' }).click()

  await expect(
    page.getByText(
      'Cotação atualizada com sucesso! 1 pedido órfão foi excluído junto.'
    )
  ).toBeVisible()
  await expect(page.getByText('POLVILHO AZEDO')).not.toBeVisible()

  const orders = await orderModel.findManyByQuoteId(quote.id)
  expect(orders.find((o) => o.id === orphanOrder.id)).toBeUndefined()
  expect(orders.find((o) => o.id === unrelatedOrder.id)).toBeDefined()
})

test('deletes the whole quote and its linked orders', async ({ page }) => {
  const { email, password } = await createUser()
  await populateDatabase()

  const quote = await quoteModel.create({
    items: makeShortageItems().slice(0, 2),
    orders: [],
    status: 'opened',
    date: QUOTE_DATE,
    observations: null
  })
  const orphanOrderA = await seedOrder(quote.id, quote.items[0].id)
  const orphanOrderB = await seedOrder(quote.id, quote.items[1].id)

  await login(page, email, password)
  await expect(page.getByRole('button', { name: 'Editar' })).toBeVisible()

  await page
    .getByRole('button', { name: 'Excluir' })
    .filter({ hasText: 'Excluir' })
    .click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Excluir' }).click()

  await expect(
    page.getByText(/^Cotação excluída com sucesso! \d+ pedidos? órfãos? /)
  ).toBeVisible()
  await expect(
    page.getByText(
      'Nenhum item nesta cotação. Crie uma cotação ou adicione itens!'
    )
  ).toBeVisible()

  await expect
    .poll(async () => quoteModel.findMany().then((q) => q.length))
    .toBe(0)

  const orders = await orderModel.findManyByQuoteId(quote.id)
  expect(orders.find((o) => o.id === orphanOrderA.id)).toBeUndefined()
  expect(orders.find((o) => o.id === orphanOrderB.id)).toBeUndefined()
})
