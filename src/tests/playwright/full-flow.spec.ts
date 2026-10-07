import fs from 'node:fs'
import path from 'node:path'

import { faker } from '@faker-js/faker'
import { expect, type Page, test } from '@playwright/test'

import { clearData, verifyEmail } from './orchestrator'

const MOCKS_DIR = path.join(import.meta.dirname, '../_mocks')
const QUOTES_DIR = path.join(MOCKS_DIR, 'quotes')

const QUOTE_1_DIR = path.join(QUOTES_DIR, 'quote-1-2026-01-10-2026-03-31')
const QUOTE_1_ITEMS = fs
  .readFileSync(path.join(QUOTE_1_DIR, 'quote.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

const QUOTE_1_XMLS = fs
  .readdirSync(QUOTE_1_DIR)
  .filter((file) => file.endsWith('.xml'))
  .map((file) => path.join(QUOTE_1_DIR, file))

const openManualReferenceForm = async (page: Page, itemDescription: string) => {
  const row = page
    .locator(`[title="${itemDescription}"]`)
    .locator('xpath=ancestor::div[2]')
  await row.getByRole('button', { name: 'Editar manualmente' }).click()

  await expect(
    page.getByRole('heading', { name: 'Referência de preço' })
  ).toBeVisible()
}

const clearAutocomplete = async (page: Page, label: string) => {
  const field = page.getByLabel(label, { exact: true })
  await field.hover()
  const clearButton = field
    .locator('xpath=ancestor::div[contains(@class,"MuiAutocomplete-root")][1]')
    .getByRole('button', { name: 'Clear' })
  await expect(clearButton).toBeVisible()
  await clearButton.click()
}

const assignAutocomplete = async (
  page: Page,
  label: string,
  search: string
) => {
  await page.getByLabel(label, { exact: true }).fill(search)
  await page.getByRole('option', { name: new RegExp(search, 'i') }).click()
}

const saveManualReferenceForm = async (page: Page) => {
  const formHeading = page.getByRole('heading', { name: 'Referência de preço' })
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(formHeading).not.toBeVisible()
}

test.beforeAll(async () => {
  await clearData()
})

test('Full flow', async ({ page }) => {
  test.setTimeout(240_000)

  const name = faker.person.fullName()
  const email = faker.internet.email()
  const password = faker.internet.password()

  await test.step('Create account, verify email and logout', async () => {
    // trying to access a private route
    await page.goto('/dashboard')

    // automatically redirected to the signin page
    await expect(page).toHaveURL(/\/signin/)
    await page.getByRole('link', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(/\/signup/)
    await page.getByLabel('Nome').fill(name)
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha', { exact: true }).fill(password)
    await page.getByLabel('Confirmar senha').fill(password)
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(/\/verify-email/)
    await verifyEmail(email)
    await page.getByRole('button', { name: 'Já verifiquei, entrar' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await page.getByRole('button', { name: 'Sair' }).click()

    // after logout, the user is automatically redirected to the signin page
    await expect(page).toHaveURL(/\/signin/)
  })

  await test.step('Login and import xlsx', async () => {
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha').fill(password)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await page.getByRole('button', { name: 'Produtos' }).click()

    await expect(page).toHaveURL(/\/products/)
    await page.getByRole('button', { name: 'Importar' }).click()

    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(MOCKS_DIR, 'import-data.xlsx'))

    await expect(
      page.getByText('import-data.xlsx', { exact: true })
    ).toBeVisible()
    await expect(page.getByText('495 produtos', { exact: true })).toBeVisible()
    await expect(page.getByText('232 famílias')).toBeVisible()
    await expect(page.getByText('78 fornecedores')).toBeVisible()
    await page.getByRole('button', { name: 'Importar 495 produtos' }).click()
    await expect(page.getByText('Dados importados com sucesso!')).toBeVisible({
      timeout: 60_000
    })

    await test.step('Create the first quote and reference all items', async () => {
      await page.getByRole('button', { name: 'Cotações' }).click()
      await expect(page).toHaveURL(/\/quotes/)

      await page.getByRole('button', { name: 'Nova Cotação' }).click()
      await page.getByLabel('Data').fill('2026-01-10')
      await page.getByLabel('Lista de faltas').fill(QUOTE_1_ITEMS.join('\n'))
      await page.getByRole('button', { name: 'Salvar' }).click()

      await expect(page.getByText('Cotação criada com sucesso!')).toBeVisible()

      await page.getByRole('button', { name: 'Referenciar com IA' }).click()

      await expect(
        page.getByRole('button', { name: /Aplicar \d+ aceitos/ })
      ).toBeVisible({ timeout: 60_000 })

      await openManualReferenceForm(page, 'SH CLEAR MEN')
      await clearAutocomplete(page, 'Produto específico')
      await assignAutocomplete(page, 'Família', 'SH CLEAR 200ML')
      await saveManualReferenceForm(page)

      await openManualReferenceForm(page, 'SANDALIA HAVAIANA FEMININA')
      await assignAutocomplete(page, 'Família', 'SAND HAVAIANAS FLAT')
      await saveManualReferenceForm(page)

      await openManualReferenceForm(page, 'CR TRATAMENTO SALON LINE')
      await assignAutocomplete(page, 'Família', 'CR TRAT SKALA 1KG')
      await saveManualReferenceForm(page)

      await openManualReferenceForm(page, 'MUCILON 180G')
      await clearAutocomplete(page, 'Produto específico')
      await assignAutocomplete(page, 'Família', 'MUCILON 230G SH')
      await saveManualReferenceForm(page)

      await page.getByRole('button', { name: 'Aplicar 7 aceitos' }).click()

      await expect(
        page.getByText('Cotação atualizada com sucesso!')
      ).toBeVisible()
    })
  })

  await test.step('Import invoices data', async () => {
    await page.getByRole('button', { name: 'Notas de Entrada' }).click()
    await expect(page).toHaveURL(/\/invoices/)

    await page.getByRole('button', { name: 'Importar Notas' }).click()
    await page.locator('input[type="file"]').setInputFiles(QUOTE_1_XMLS)
    await page.getByRole('button', { name: 'Importar 9 notas' }).click()
    await expect(
      page.getByText('9 notas importadas com sucesso!')
    ).toBeVisible()
  })

  await test.step('Link an invoice item to a quote order', async () => {
    // First invoice: a single registered item, routes straight to the order form
    await page.getByText('8995473').click()
    await expect(page.getByText('NF nº 8995473 — Série 0')).toBeVisible()

    await page.getByRole('button', { name: 'Vincular pedidos' }).click()
    await expect(
      page.getByRole('heading', { name: 'Vincular pedidos' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Confirmar (1)' }).click()

    const orderFormHeading = page.getByRole('heading', { name: 'Novo Pedido' })
    await expect(orderFormHeading).toBeVisible()
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Pedido criado com sucesso!')).toBeVisible()

    // The other 15 items have no registered product, so they stay without an
    // order and the invoice can't be approved yet
    await expect(page.getByText('15 sem pedido')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Aprovar nota' })
    ).toBeDisabled()
  })

  await test.step('Confirm a batch of same-family invoice items', async () => {
    await page.getByRole('button', { name: 'Notas de Entrada' }).click()
    await expect(page).toHaveURL(/\/invoices/)

    await page.getByText('9001').click()
    await expect(page.getByText('NF nº 9001 — Série 1')).toBeVisible()

    await page.getByRole('button', { name: 'Vincular pedidos' }).click()
    const linkDialogHeading = page.getByRole('heading', {
      name: 'Vincular pedidos'
    })
    await expect(linkDialogHeading).toBeVisible()
    const linkDialog = linkDialogHeading.locator(
      'xpath=ancestor::div[contains(@class,"MuiPaper-root")][1]'
    )

    await linkDialog.getByRole('button', { name: /Confirmar \(\d+\)/ }).click()

    const batchHeading = page.getByRole('heading', {
      name: 'Confirmar pedidos em lote'
    })
    await expect(batchHeading).toBeVisible()
    const batchDialog = batchHeading.locator(
      'xpath=ancestor::div[contains(@class,"MuiPaper-root")][1]'
    )
    await expect(
      batchDialog.getByText('SAND HAVAIANAS ELEGANCE 37 38 PRETO')
    ).toBeVisible()
    await expect(
      batchDialog.getByText('SAND HAVAIANAS ELEGANCE 39 40 PRT BLOBBOM FC')
    ).toBeVisible()

    await batchDialog.getByRole('button', { name: /Confirmar \(\d+\)/ }).click()

    await expect(
      page.getByText(/pedidos? vinculados? com sucesso!/)
    ).toBeVisible()
  })
})
