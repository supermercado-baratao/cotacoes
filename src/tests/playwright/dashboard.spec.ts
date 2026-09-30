import { expect, type Locator, type Page, test } from '@playwright/test'

import type { TInvoice, TInvoiceItem, TProduct, TQuote } from '@/models'
import {
  invoiceModel,
  productModel,
  quoteModel,
  settingsModel,
  supplierModel
} from '@/models'

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

// A tela busca notas dos últimos 30 dias (defaultInvoiceDateRange em
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

const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

const getRow = (page: Page, description: string): Locator =>
  page
    .getByText(description, { exact: true })
    .locator('xpath=ancestor::*[@role="row"][1]')

test.beforeAll(async () => {
  await clearData()
})

test('shows aggregate stats and flags products outside the configured margin range', async ({
  page
}) => {
  const { email, password } = await createUser()

  // Piso 25% / teto 35% de margem — aplicado a todo o catálogo, não depende
  // de nenhum campo por produto.
  await settingsModel.upsert({ marginTolerance: { below: 25, above: 35 } })

  // 5 produtos cadastrados, dos quais só 2 têm custo apurado e só 1 deles
  // vende abaixo da margem mínima.
  await Promise.all([
    // preço 100, custo 80 -> margem atual 20%; piso 25% -> abaixo
    productModel.create(
      makeProduct({
        id: 'p1',
        description: 'PRODUTO ABAIXO',
        costWithTax: 80
      })
    ),
    // preço 100, custo 50 -> margem atual 50%; teto 35% -> acima
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

  // Este teste cobre os totais do catálogo inteiro, não o filtro por período
  // de entrada — desliga o filtro pra não depender de notas vinculadas aos
  // produtos criados aqui (cenário de período é coberto no teste abaixo).
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

  // PRODUTO ACIMA vende com margem atual (50%) acima do teto (35%), então
  // aparece na seção "acima da margem", não na de "abaixo".
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

  // Todos abaixo da margem (piso 25%): preço 100, custo 80 -> margem 20%.
  // As notas trazem o mesmo custo do VR (80), já que o custo médio das notas
  // do período prevalece sobre o do VR.
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

  // Filtro de período ligado por padrão (últimos 30 dias): só ENTRADA
  // RECENTE tem uma nota emitida dentro do período e já carregada. ENTRADA
  // ANTIGA (nota de 60 dias atrás — nem carregada ainda, já que a busca
  // global de Notas de Entrada também é limitada a 30 dias por padrão) e SEM
  // ENTRADA (nunca teve nota vinculada) somem, pois o filtro exige presença
  // confirmada numa nota do período.
  await expect(page.getByText('ENTRADA RECENTE')).toBeVisible()
  await expect(page.getByText('ENTRADA ANTIGA')).not.toBeVisible()
  await expect(page.getByText('SEM ENTRADA')).not.toBeVisible()

  // Amplia a busca em Notas de Entrada pra trazer a nota de 60 dias atrás.
  await page.getByRole('button', { name: 'Notas de Entrada' }).click()
  await expect(page).toHaveURL(/\/invoices/)
  await page.getByLabel('De', { exact: true }).fill(daysAgo(70))
  await page.getByRole('button', { name: 'Buscar' }).click()
  await page.getByPlaceholder('Buscar por NF, fornecedor ou item...').fill('i2')
  await expect(page.getByText('i2', { exact: true })).toBeVisible({
    timeout: 10000
  })

  // De volta ao Dashboard: a nota já está carregada, mas ENTRADA ANTIGA
  // ainda some, pois o período do próprio Dashboard segue nos últimos 30
  // dias.
  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText('ENTRADA ANTIGA')).not.toBeVisible()

  // Amplia o início do período do próprio Dashboard -> ENTRADA ANTIGA passa
  // a ser reconhecida dentro do período e volta a aparecer.
  await page.getByLabel('Início do período').fill(daysAgo(70))
  await expect(page.getByText('ENTRADA RECENTE')).toBeVisible()
  await expect(page.getByText('ENTRADA ANTIGA')).toBeVisible()
  await expect(page.getByText('SEM ENTRADA')).not.toBeVisible()

  // Desligando o filtro de período: todo o catálogo abaixo da margem
  // aparece, inclusive o produto sem nenhuma nota vinculada.
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

  // preço 100, custo 80 (VR e nota) -> margem 20%; piso 25% -> abaixo.
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
    .getByRole('menuitem', { name: 'Ver notas' })
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

  // A margem usa o custo do VR (10) -> 50%, abaixo do piso de 60%. Pelas
  // notas: 2 CX com 12 unidades cada (embalagem do VR pro código do
  // fornecedor) a 216,00 = 432,00 pagos, mais 6 unidades bonificadas (CFOP
  // 5910), cujo valor é ignorado -> 432 / (24 + 6) = 14,40 por unidade, que
  // diverge +44% do VR -> atenção.
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
            // Unidade tributável igual à comercial (Valor Unit. Trib. igual ao
            // Valor Unit.) — a conversão cai pra embalagem do VR.
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

  // A célula de descrição também traz o selo "Bonificação", então o texto
  // exato do produto não basta pra achar a linha.
  const row = page.getByRole('row').filter({ hasText: 'PRODUTO BONIFICADO' })
  await expect(row).toBeVisible()
  await expect(row.getByText('Bonificação')).toBeVisible()
  await expect(row.getByText('R$ 10,00')).toBeVisible()
  await expect(row.getByLabel('Atenção: custo divergente do VR')).toBeVisible()

  await row.getByRole('menuitem', { name: 'Ver notas' }).click()
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

  // Preço 100. VR 80 -> margem 20% (abaixo do piso de 25%). Notas: 70 e 60
  // -> média 65 -> 35% (dentro da faixa); última NF 60 -> 40% (acima do teto
  // de 38%).
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

  // Média das notas põe a margem dentro da faixa: a linha continua na tabela
  // (pra poder voltar a escolha), mas deixa de contar como alerta.
  await entriesOption.click()
  await expect(row.getByText('R$ 65,00')).toBeVisible()
  await expect(row.getByText('35.0%')).toBeVisible()
  await expect(row.getByText('Dentro da margem')).toBeVisible()
  await expect(belowMarginCard.getByText('0', { exact: true })).toBeVisible()

  // Última NF põe a margem acima do teto: a linha muda de tabela.
  await costSelect.click()
  await page.getByRole('option', { name: /Última NF paga/ }).click()
  await expect(
    aboveMarginSection.getByText('PRODUTO CUSTO', { exact: true })
  ).toBeVisible()
  await expect(
    belowMarginSection.getByText('PRODUTO CUSTO', { exact: true })
  ).not.toBeVisible()
  await expect(getRow(page, 'PRODUTO CUSTO').getByText('40.0%')).toBeVisible()
})
