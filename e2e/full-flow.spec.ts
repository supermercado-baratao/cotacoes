import path from 'node:path'

import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { clearEmulatorData, verifyEmail } from './utils/emulator'

const FIXTURES = path.join(import.meta.dirname, '../src/tests/_mocks')
const INVOICE_XML = path.join(
  FIXTURES,
  'xmls/NFe29260632053743000116550020000001081299331431.xml'
)

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  await clearEmulatorData()
})

test('Fluxo completo: cadastro, import, notas, cotação e vínculo de pedido', async ({
  page
}) => {
  test.setTimeout(120000)

  const name = faker.person.fullName()
  const email = faker.internet.email()
  const password = faker.internet.password()

  await test.step('Cria a conta e verifica o e-mail', async () => {
    await page.goto('/signup')
    await page.getByLabel('Nome').fill(name)
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha', { exact: true }).fill(password)
    await page.getByLabel('Confirmar senha').fill(password)
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(/\/verify-email/)
    await verifyEmail(email)
    await page.getByRole('button', { name: 'Já verifiquei, entrar' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  await test.step('Importa o catálogo de produtos via XLSX', async () => {
    await page.goto('/import')
    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(FIXTURES, 'import-data.xlsx'))

    await expect(page.getByText('495 produtos', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Importar 495 produtos' }).click()
    await expect(page.getByText('Dados importados com sucesso!')).toBeVisible({
      timeout: 10000
    })
  })

  await test.step('Importa uma nota fiscal', async () => {
    await page.goto('/invoices')
    await page.getByRole('button', { name: 'Importar Notas' }).click()
    await page.locator('input[type="file"]').setInputFiles(INVOICE_XML)

    await expect(page.getByText('NF nº 108 — Série 2')).toBeVisible()
    await page.getByRole('button', { name: 'Importar 1 nota' }).click()
    await expect(page.getByText('1 nota importada com sucesso!')).toBeVisible({
      timeout: 10000
    })
  })

  await test.step('Cria uma cotação e referencia o item manualmente', async () => {
    await page.goto('/quotes')
    await page.getByRole('button', { name: 'Nova Cotação' }).click()

    await page.getByLabel('Data').fill('2026-06-01')
    await page.getByLabel('Lista de faltas').fill('PIMENTA DO REINO')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Cotação criada com sucesso!')).toBeVisible()

    const row = page.getByRole('row').filter({ hasText: 'PIMENTA DO REINO' })
    await row.getByRole('menuitem', { name: 'Referenciar' }).click()

    const productInput = page.getByLabel('Produto específico')
    await productInput.fill('PIMENTA DO REINO MOIDO NOTA 10 50G PCT')
    await page
      .getByRole('option', { name: 'PIMENTA DO REINO MOIDO NOTA 10 50G PCT' })
      .click()

    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(
      page.getByText('Cotação atualizada com sucesso!')
    ).toBeVisible()
  })

  await test.step('Vincula um item da nota ao pedido da cotação', async () => {
    await page.goto('/invoices')
    await page.getByText('108').click()
    await expect(page.getByText('NF nº 108 — Série 2')).toBeVisible()

    await page.getByRole('button', { name: 'Vincular pedidos' }).click()
    const dialog = page.getByRole('heading', { name: 'Vincular pedidos' })
    await expect(dialog).toBeVisible()

    await page.getByRole('button', { name: /Confirmar \(\d+\)/ }).click()
    await expect(
      page.getByText(/pedido(s)? vinculado(s)? com sucesso!/)
    ).toBeVisible()
  })
})
