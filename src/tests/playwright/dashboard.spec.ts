import { expect, test } from '@playwright/test'

import type { TInvoice, TProduct, TQuote } from '@/models'
import { invoiceModel, productModel, quoteModel } from '@/models'

import { clearData, createUser } from './orchestrator'

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

// A tela busca notas dos últimos 90 dias (defaultInvoiceDateRange em
// use-app-store.ts) — precisa ser uma data recente, não fixa, pra cair
// dentro dessa janela sempre que o teste rodar.
const RECENT_EMISSION_DATE = new Date().toISOString().slice(0, 10)

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

test.beforeAll(async () => {
  await clearData()
})

test('shows aggregate stats and flags products sold below their target margin', async ({
  page
}) => {
  const { email, password } = await createUser()

  // 5 produtos cadastrados, dos quais só 2 têm custo apurado e só 1 deles
  // vende abaixo da margem padrão.
  await Promise.all([
    // preço 100, custo 70 -> margem atual 30%; padrão 40% -> abaixo
    productModel.create(
      makeProduct({
        id: 'p1',
        description: 'PRODUTO ABAIXO',
        margin: 40,
        costWithTax: 70
      })
    ),
    // preço 100, custo 70 -> margem atual 30%; padrão 20% -> acima
    productModel.create(
      makeProduct({
        id: 'p2',
        description: 'PRODUTO OK',
        margin: 20,
        costWithTax: 70
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
    // 3 cotações abertas, 1 fechada
    quoteModel.create(makeQuote({ status: 'opened' })),
    quoteModel.create(makeQuote({ status: 'opened' })),
    quoteModel.create(makeQuote({ status: 'opened' })),
    quoteModel.create(makeQuote({ status: 'closed' })),
    // 2 notas pendentes, 1 aprovada
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

  const productsCard = page.getByText('Produtos cadastrados').locator('..')
  await expect(productsCard.getByText('5', { exact: true })).toBeVisible()

  const quotesCard = page.getByText('Cotações abertas').locator('..')
  await expect(quotesCard.getByText('3', { exact: true })).toBeVisible()

  const invoicesCard = page
    .getByText('Notas pendentes de verificação')
    .locator('..')
  await expect(invoicesCard.getByText('2', { exact: true })).toBeVisible()

  // "Produtos abaixo/acima da margem" aparecem duas vezes cada: como rótulo
  // do card e como título da seção da tabela — o card é o primeiro no DOM.
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

  // PRODUTO OK vende com margem atual (30%) acima da padrão (20%), então
  // aparece na seção "acima da margem", não na de "abaixo".
  const belowMarginSection = page
    .getByText('Produtos abaixo da margem')
    .last()
    .locator('..')
  await expect(belowMarginSection.getByText('PRODUTO OK')).not.toBeVisible()

  const aboveMarginSection = page
    .getByText('Produtos acima da margem')
    .last()
    .locator('..')
  await expect(aboveMarginSection.getByText('PRODUTO OK')).toBeVisible()
})
