import path from 'node:path'

import { expect, type Page, test } from '@playwright/test'
import dayjs from 'dayjs'

import { invoiceModel } from '@/models/invoice/model'
import type { TInvoice } from '@/models/invoice/types'
import { orderModel } from '@/models/order/model'
import { productModel } from '@/models/product/model'
import { quoteModel } from '@/models/quote/model'
import { settingsModel } from '@/models/settings/model'
import { supplierModel } from '@/models/supplier/model'
import { clearData, createUser, populateDatabase } from '@/tests/orchestrator'

const MOCKS_DIR = path.join(import.meta.dirname, '../_mocks')
const QUOTE_DIR = 'quotes/quote-3-2026-06-01-2026-07-09'
const INVOICE_XML = 'NFe29260632053743000116550020000001081299331431.xml'

const login = async (page: Page, email: string, password: string) => {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await page.getByRole('button', { name: 'Notas de Entrada' }).click()
  await expect(page).toHaveURL(/\/invoices/)
  // A lista mostra por padrão só os últimos 90 dias a partir de hoje — fixa
  // o início do período pra que as notas dos fixtures (2026) continuem
  // visíveis independentemente da data em que o teste roda.
  await page.getByLabel('De', { exact: true }).fill('2026-01-01')
  await page.getByRole('button', { name: 'Buscar' }).click()
}

const openImportDialog = async (page: Page) => {
  await page.getByRole('button', { name: 'Importar Notas' }).click()
}

const uploadXml = (page: Page, relativePath: string) =>
  page
    .locator('input[type="file"]')
    .setInputFiles(path.join(MOCKS_DIR, relativePath))

// Pedidos só podem ser criados pra notas de um fornecedor já cadastrado no
// catálogo — reaproveita um fornecedor real do import-data.xlsx em vez de um
// CNPJ inventado, senão o botão "Confirmar" fica desabilitado.
const getRegisteredSupplier = async () => {
  const suppliers = await supplierModel.findMany()
  return suppliers[0]
}

test.beforeAll(async () => {
  await clearData()
})

test('imports an invoice, blocks reimporting it and rejects an XML without an access key', async ({
  page
}) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  await populateDatabase()
  await login(page, email, password)

  await test.step('imports a new invoice showing registration status', async () => {
    await openImportDialog(page)
    await uploadXml(page, `${QUOTE_DIR}/${INVOICE_XML}`)

    await expect(page.getByText('NF nº 108 — Série 2')).toBeVisible()
    await expect(
      page.getByText('NOTA 10 CONDIMENTOS E ESPECIARIAS.')
    ).toBeVisible()
    await expect(page.getByText(/Fornecedor não encontrado/)).not.toBeVisible()
    await expect(page.getByText('5/21 produtos cadastrados')).toBeVisible()

    await page.getByRole('button', { name: 'Ver itens' }).click()
    await expect(page.getByText('PIMENTA DO REINO MOIDA 50G')).toBeVisible()
    await expect(
      page.getByText('PIMENTA DO REINO MOIDO NOTA 10 50G PCT')
    ).toBeVisible()
    await expect(page.getByText('Não cadastrado')).toHaveCount(16)

    await page.getByRole('button', { name: 'Importar 1 nota' }).click()
    await expect(page.getByText('1 nota importada com sucesso!')).toBeVisible()

    await expect(page.getByText('108')).toBeVisible()
    await expect(page.getByLabel('Cadastrado')).toBeVisible()
    await expect(page.getByText('5/21')).toBeVisible()
    await expect(page.getByText('0/21')).toBeVisible()
    await expect(page.getByText('Pendente')).toBeVisible()
  })

  await test.step('does not reimport an already-existing invoice', async () => {
    await openImportDialog(page)
    await uploadXml(page, `${QUOTE_DIR}/${INVOICE_XML}`)

    await expect(
      page.getByText('1 nota já foi importada anteriormente e será ignorada')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Importar' })).toBeDisabled()

    await page.getByRole('button', { name: 'Ver detalhes' }).click()
    await expect(
      page.getByText('29260632053743000116550020000001081299331431')
    ).toBeVisible()
    await page.keyboard.press('Escape')
  })

  await test.step('rejects an XML file without a valid access key', async () => {
    await openImportDialog(page)

    const invalidXml =
      '<?xml version="1.0"?><nfeProc><NFe><infNFe><ide><nNF>1</nNF></ide></infNFe></NFe></nfeProc>'
    await page.locator('input[type="file"]').setInputFiles({
      name: 'invalido.xml',
      mimeType: 'text/xml',
      buffer: Buffer.from(invalidXml)
    })

    await expect(page.getByText('invalido.xml:')).toBeVisible()
    await expect(
      page.getByText('Chave de acesso NFe inválida ou ausente no arquivo')
    ).toBeVisible()

    await page.getByRole('alert').getByRole('button').click()
    await expect(page.getByText('invalido.xml:')).not.toBeVisible()
  })
})

test('completes the fiscal data of an invoice imported before those fields existed', async ({
  page
}) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  await populateDatabase()
  await login(page, email, password)

  await openImportDialog(page)
  await uploadXml(page, `${QUOTE_DIR}/${INVOICE_XML}`)
  await page.getByRole('button', { name: 'Importar 1 nota' }).click()
  await expect(page.getByText('1 nota importada com sucesso!')).toBeVisible()

  // Regrava a nota como ficaria antes dos campos fiscais (sem natOp, CFOP,
  // custo com impostos e unidade tributável), já conferida no app.
  const [imported] = await invoiceModel.findMany({
    startDate: '2026-06-01',
    endDate: '2026-06-30'
  })
  const legacy = {
    ...imported,
    verificationStatus: 'approved',
    items: imported.items.map((item) => {
      const legacyItem: Partial<typeof item> = { ...item }
      delete legacyItem.cfop
      delete legacyItem.totalCost
      delete legacyItem.tribUnit
      delete legacyItem.tribQuantity
      delete legacyItem.tribUnitPrice
      return legacyItem
    })
  } as TInvoice
  delete legacy.operationNature
  await invoiceModel.deleteUniqueById(imported.id)
  await invoiceModel.create(legacy)
  await page.reload()
  await page.getByLabel('De', { exact: true }).fill('2026-01-01')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByText('Aprovada')).toBeVisible()

  await openImportDialog(page)
  await uploadXml(page, `${QUOTE_DIR}/${INVOICE_XML}`)
  await expect(
    page.getByText(
      /1 nota já importada será completada com os dados fiscais do XML/
    )
  ).toBeVisible()
  await page.getByRole('button', { name: 'Completar 1 nota' }).click()
  await expect(page.getByText('1 nota completada com sucesso!')).toBeVisible()

  await expect(page.getByText('Aprovada')).toBeVisible()
  const [completed] = await invoiceModel.findMany({
    startDate: '2026-06-01',
    endDate: '2026-06-30'
  })
  expect(completed.verificationStatus).toBe('approved')
  expect(completed.operationNature).toBeTruthy()
  expect(completed.items.every((item) => item.cfop)).toBe(true)
  expect(completed.items.every((item) => item.totalCost != null)).toBe(true)

  await test.step('treats the completed invoice as a regular duplicate afterwards', async () => {
    await openImportDialog(page)
    await uploadXml(page, `${QUOTE_DIR}/${INVOICE_XML}`)
    await expect(
      page.getByText('1 nota já foi importada anteriormente e será ignorada')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Importar' })).toBeDisabled()
  })
})

test('links an invoice item to a quote order', async ({ page }) => {
  test.setTimeout(30_000)
  const { email, password } = await createUser()
  await populateDatabase()
  const supplier = await getRegisteredSupplier()

  const quoteItemId = crypto.randomUUID()
  const quote = await quoteModel.create({
    items: [
      {
        id: quoteItemId,
        description: 'PIMENTA DO REINO',
        salePrice: null,
        priceRef: { type: 'product', id: '210049' }
      }
    ],
    orders: [],
    status: 'opened',
    date: '2026-06-01',
    observations: null
  })

  const invoice: Omit<TInvoice, 'createdAt' | 'updatedAt'> = {
    id: crypto.randomUUID(),
    accessKey: 'access-key-link-test',
    number: 'LINKTEST',
    series: '1',
    emissionDate: '2026-06-20T10:00:00-03:00',
    supplierCnpj: supplier.cnpj,
    supplierName: supplier.tradeName ?? supplier.legalName,
    destinationCnpj: '22222222000122',
    totalValue: 90,
    items: [
      {
        itemNumber: 1,
        supplierProductCode: 'A1',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'PIMENTA DO REINO MOIDA TESTE',
        unit: 'UN',
        quantity: 50,
        unitPrice: 1.8,
        totalPrice: 90,
        tribUnit: 'UN',
        tribQuantity: 50,
        tribUnitPrice: 1.8,
        productId: '210049',
        orderId: null,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      }
    ],
    verificationStatus: 'pending',
    quoteId: null
  }
  await invoiceModel.create(invoice)

  await login(page, email, password)
  await page.getByText('LINKTEST').click()

  await expect(page.getByText('NF nº LINKTEST — Série 1')).toBeVisible()
  await expect(page.getByText('1 sem pedido')).toBeVisible()

  await page.getByRole('button', { name: 'Vincular pedidos' }).click()

  const linkDialog = page
    .getByRole('heading', { name: 'Vincular pedidos' })
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await expect(
    linkDialog.getByText('PIMENTA DO REINO MOIDA TESTE')
  ).toBeVisible()
  await linkDialog.getByRole('button', { name: 'Confirmar (1)' }).click()

  const orderForm = page.getByRole('heading', { name: 'Novo Pedido' })
  await expect(orderForm).toBeVisible()
  await page.getByRole('button', { name: 'Salvar' }).click()

  await expect(page.getByText('Pedido criado com sucesso!')).toBeVisible()

  // Salvar o pedido navega pra tela de cotações — confirma o vínculo direto
  // pelo model em vez de disputar com essa navegação na UI.
  await expect
    .poll(async () => {
      const orders = await orderModel.findManyByQuoteId(quote.id)
      return (
        orders.find((o) => o.quoteItemId === quoteItemId)?.invoiceId ?? null
      )
    })
    .not.toBeNull()
})

test('back button returns to the page it was opened from, and items can be filtered by product', async ({
  page
}) => {
  test.setTimeout(30_000)
  const { email, password } = await createUser()

  await settingsModel.upsert({ marginTolerance: { below: 25, above: 100 } })

  // preço 100, custo 80 -> margem 20%; piso 25% -> abaixo, aparece no
  // Dashboard.
  await productModel.create({
    id: 'pback1',
    description: 'PRODUTO BACK TEST',
    price: 100,
    barcodes: [],
    packTypes: [],
    tax: null,
    margin: null,
    costWithTax: 80,
    observations: null,
    familyId: null,
    departmentId: null,
    department: '',
    section: '',
    group: '',
    stock: 0,
    vrCreatedAt: '2026-01-01'
  })

  const invoiceId = crypto.randomUUID()
  const invoice: Omit<TInvoice, 'createdAt' | 'updatedAt'> = {
    id: invoiceId,
    accessKey: 'access-key-back-test',
    number: 'BACKTEST',
    series: '1',
    emissionDate: dayjs().format('YYYY-MM-DD'),
    supplierCnpj: '11111111000111',
    supplierName: 'FORNECEDOR BACK',
    destinationCnpj: '22222222000122',
    totalValue: 110,
    items: [
      {
        itemNumber: 1,
        supplierProductCode: '1',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'PRODUTO BACK TEST NF',
        unit: 'UN',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100,
        tribUnit: 'UN',
        tribQuantity: 1,
        tribUnitPrice: 100,
        productId: 'pback1',
        orderId: null,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      },
      {
        itemNumber: 2,
        supplierProductCode: '2',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'OUTRO ITEM SEM RELACAO',
        unit: 'UN',
        quantity: 1,
        unitPrice: 10,
        totalPrice: 10,
        tribUnit: 'UN',
        tribQuantity: 1,
        tribUnitPrice: 10,
        productId: null,
        orderId: null,
        matchStatus: 'unmatched_product',
        priceDivergence: null,
        quantityDivergence: null
      }
    ],
    verificationStatus: 'pending',
    quoteId: null
  }
  await invoiceModel.create(invoice)

  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  await test.step('opening the invoice via the Dashboard "ver nota" link, back returns to the Dashboard', async () => {
    await expect(page.getByText('PRODUTO BACK TEST')).toBeVisible()
    await page
      .getByText('PRODUTO BACK TEST', { exact: true })
      .locator('xpath=ancestor::*[@role="row"][1]')
      .getByRole('button', { name: 'Ver notas' })
      .click()
    await page.getByRole('link', { name: 'Ver nota fiscal' }).click()

    await expect(page).toHaveURL(new RegExp(`/invoices/${invoiceId}`))
    await expect(page.getByText('NF nº BACKTEST')).toBeVisible()

    await page.getByRole('button', { name: 'Voltar' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  await test.step('opening the invoice from the invoices list, back returns to the list', async () => {
    await page.getByRole('button', { name: 'Notas de Entrada' }).click()
    await expect(page).toHaveURL(/\/invoices/)
    await page.getByText('BACKTEST', { exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/invoices/${invoiceId}`))

    await page.getByRole('button', { name: 'Voltar' }).click()
    await expect(page).toHaveURL(/\/invoices$/)
  })

  await test.step('filters the invoice items by product', async () => {
    await page.getByText('BACKTEST', { exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/invoices/${invoiceId}`))
    await expect(page.getByText('PRODUTO BACK TEST NF')).toBeVisible()
    await expect(page.getByText('OUTRO ITEM SEM RELACAO')).toBeVisible()

    await page
      .getByPlaceholder('Buscar por produto, código ou descrição...')
      .fill('PRODUTO BACK TEST')

    await expect(page.getByText('PRODUTO BACK TEST NF')).toBeVisible()
    await expect(page.getByText('OUTRO ITEM SEM RELACAO')).not.toBeVisible()
  })
})

test('confirms a batch of same-family invoice items with matching packaging', async ({
  page
}) => {
  test.setTimeout(30_000)
  const { email, password } = await createUser()
  await populateDatabase()
  const supplier = await getRegisteredSupplier()

  await quoteModel.create({
    items: [
      {
        id: crypto.randomUUID(),
        description: 'SANDALIA HAVAIANAS COLOR',
        salePrice: null,
        priceRef: { type: 'family', id: '67' }
      }
    ],
    orders: [],
    status: 'opened',
    date: '2026-06-01',
    observations: null
  })

  await invoiceModel.create({
    id: crypto.randomUUID(),
    accessKey: 'access-key-batch-9001',
    number: '9001',
    series: '1',
    emissionDate: '2026-06-20T10:00:00-03:00',
    supplierCnpj: supplier.cnpj,
    supplierName: supplier.tradeName ?? supplier.legalName,
    destinationCnpj: '22222222000122',
    totalValue: 92.9,
    items: [
      {
        itemNumber: 1,
        supplierProductCode: 'A1',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'SAND HAVAIANAS COLOR 43 44 BRANCO',
        unit: 'UN',
        quantity: 2,
        unitPrice: 18.58,
        totalPrice: 37.16,
        tribUnit: 'UN',
        tribQuantity: 2,
        tribUnitPrice: 18.58,
        productId: '204682',
        orderId: null,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      },
      {
        itemNumber: 2,
        supplierProductCode: 'A2',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'SAND HAVAIANAS COLOR 35 36 AZUL NAVAL',
        unit: 'UN',
        quantity: 3,
        unitPrice: 18.58,
        totalPrice: 55.74,
        tribUnit: 'UN',
        tribQuantity: 3,
        tribUnitPrice: 18.58,
        productId: '204364',
        orderId: null,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      }
    ],
    verificationStatus: 'pending',
    quoteId: null
  })

  await login(page, email, password)
  await page.getByText('9001').click()
  await expect(page.getByText('NF nº 9001 — Série 1')).toBeVisible()

  await page.getByRole('button', { name: 'Vincular pedidos' }).click()
  const linkDialog = page
    .getByRole('heading', { name: 'Vincular pedidos' })
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await linkDialog.getByRole('button', { name: 'Confirmar (2)' }).click()

  const batchDialog = page
    .getByRole('heading', { name: 'Confirmar pedidos em lote' })
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await expect(
    batchDialog.getByText('SAND HAVAIANAS COLOR 43 44 BRANCO')
  ).toBeVisible()
  await expect(
    batchDialog.getByText('SAND HAVAIANAS COLOR 35 36 AZUL NAVAL')
  ).toBeVisible()

  await batchDialog.getByRole('button', { name: 'Confirmar (2)' }).click()

  await expect(
    page.getByText('2 pedidos vinculados com sucesso!')
  ).toBeVisible()
})

test('splits out a packaging outlier and confirms the rest of the batch individually', async ({
  page
}) => {
  test.setTimeout(30_000)
  const { email, password } = await createUser()
  await populateDatabase()
  const supplier = await getRegisteredSupplier()

  await quoteModel.create({
    items: [
      {
        id: crypto.randomUUID(),
        description: 'SANDALIA HAVAIANAS COLOR',
        salePrice: null,
        priceRef: { type: 'family', id: '67' }
      }
    ],
    orders: [],
    status: 'opened',
    date: '2026-06-01',
    observations: null
  })

  await invoiceModel.create({
    id: crypto.randomUUID(),
    accessKey: 'access-key-batch-9002',
    number: '9002',
    series: '1',
    emissionDate: '2026-06-20T10:00:00-03:00',
    supplierCnpj: supplier.cnpj,
    supplierName: supplier.tradeName ?? supplier.legalName,
    destinationCnpj: '22222222000122',
    totalValue: 148.64,
    items: [
      {
        itemNumber: 1,
        supplierProductCode: 'B1',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'SAND HAVAIANAS COLOR 41 42 PRETO',
        unit: 'UN',
        quantity: 1,
        unitPrice: 18.58,
        totalPrice: 18.58,
        tribUnit: 'UN',
        tribQuantity: 1,
        tribUnitPrice: 18.58,
        productId: '204360',
        orderId: null,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      },
      {
        itemNumber: 2,
        supplierProductCode: 'B2',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'SAND HAVAIANAS COLOR 39 40 AZUL NAVAL',
        unit: 'UN',
        quantity: 1,
        unitPrice: 18.58,
        totalPrice: 18.58,
        tribUnit: 'UN',
        tribQuantity: 1,
        tribUnitPrice: 18.58,
        productId: '204380',
        orderId: null,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      },
      {
        itemNumber: 3,
        supplierProductCode: 'B3',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'SAND HAVAIANAS COLOR 43 44 VERDE PATRIA FC',
        unit: 'CX',
        quantity: 6,
        unitPrice: 18.58,
        totalPrice: 111.48,
        tribUnit: 'CX',
        tribQuantity: 6,
        tribUnitPrice: 18.58,
        productId: '218055',
        orderId: null,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      }
    ],
    verificationStatus: 'pending',
    quoteId: null
  })

  await login(page, email, password)
  await page.getByText('9002').click()
  await expect(page.getByText('NF nº 9002 — Série 1')).toBeVisible()

  await page.getByRole('button', { name: 'Vincular pedidos' }).click()
  const linkDialog = page
    .getByRole('heading', { name: 'Vincular pedidos' })
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await linkDialog.getByRole('button', { name: 'Confirmar (3)' }).click()

  const batchDialog = page
    .getByRole('heading', { name: 'Confirmar pedidos em lote' })
    .locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]')
  await expect(
    batchDialog.getByText(
      /ficou de fora deste lote|itens ficaram de fora deste lote/
    )
  ).toBeVisible()
  await expect(
    batchDialog.getByText('SAND HAVAIANAS COLOR 41 42 PRETO')
  ).toBeVisible()
  await expect(
    batchDialog.getByText('SAND HAVAIANAS COLOR 39 40 AZUL NAVAL')
  ).toBeVisible()

  await batchDialog.getByRole('button', { name: 'Confirmar (2)' }).click()

  await expect(
    page.getByText('2 pedidos vinculados com sucesso!')
  ).toBeVisible()

  const orderForm = page.getByRole('heading', { name: 'Novo Pedido' })
  await expect(orderForm).toBeVisible()
  const orderFormDialog = orderForm.locator(
    'xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]'
  )
  await expect(
    orderFormDialog.getByText('SAND HAVAIANAS COLOR 43 44 VERDE PATRIA FC')
  ).toBeVisible()

  await orderFormDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Pedido criado com sucesso!')).toBeVisible()
})
