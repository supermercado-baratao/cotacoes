import path from 'node:path'

import { expect, test } from '@playwright/test'

import { createUser, populateDatabase } from '@/tests/orchestrator'

const MOCKS_DIR = path.join(import.meta.dirname, '../_mocks')

const login = async (
  page: import('@playwright/test').Page,
  email: string,
  password: string
) => {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await page.getByRole('button', { name: 'Produtos' }).click()
  await expect(page).toHaveURL(/\/products/)
}

test('imports products, families, departments and suppliers into an empty database', async ({
  page
}) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  await login(page, email, password)

  await page.getByRole('button', { name: 'Importar' }).click()
  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(MOCKS_DIR, 'import-data.xlsx'))

  await expect(
    page.getByText('import-data.xlsx', { exact: true })
  ).toBeVisible()
  await expect(page.getByText('495 produtos', { exact: true })).toBeVisible()
  await expect(page.getByText('232 famílias')).toBeVisible()
  await expect(page.getByText('12 departamentos')).toBeVisible()
  await expect(page.getByText('78 fornecedores')).toBeVisible()
  await expect(page.getByText('207826')).toBeVisible()
  await expect(page.getByText('PUDIM BRETZKE 50G CHOCOLATE')).toBeVisible()
  await expect(page.getByText('495 linhas selecionadas')).toBeVisible()

  await page.getByRole('button', { name: 'Importar 495 produtos' }).click()
  await expect(page.getByText('Dados importados com sucesso!')).toBeVisible({
    timeout: 20_000
  })

  await page.getByPlaceholder('Buscar produto...').fill('PUDIM BRETZKE 50G')
  await expect(page.getByText('PUDIM BRETZKE 50G CHOCOLATE')).toBeVisible()
  await expect(page.getByText('R$ 3,15')).toBeVisible()
})

test('reimporting a file only selects changed products', async ({ page }) => {
  test.setTimeout(60_000)
  const { email, password } = await createUser()
  // A base de 495 produtos vem do fast-seed (mesmo pipeline de import, sem
  // passar pela UI) — o que este teste exercita de fato é o diff/reimport.
  await populateDatabase()
  await login(page, email, password)

  await page.getByRole('button', { name: 'Importar' }).click()
  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(MOCKS_DIR, 'edited-import-data.xlsx'))

  await expect(
    page.getByText('edited-import-data.xlsx', { exact: true })
  ).toBeVisible()
  await expect(page.getByText('10 produtos', { exact: true })).toBeVisible()
  await expect(page.getByText('5 famílias')).toBeVisible()
  await expect(page.getByText('4 departamentos')).toBeVisible()
  await expect(page.getByText('8 fornecedores')).toBeVisible()
  await expect(page.getByText('7 sem alterações')).toBeVisible()
  await expect(page.getByText('3 linhas selecionadas')).toBeVisible()
  await expect(page.getByText('Alterado')).toHaveCount(3)
  await expect(page.getByText('Sem alteração')).toHaveCount(7)

  await page.getByRole('button', { name: 'Importar 3 produtos' }).click()
  await expect(page.getByText('Dados importados com sucesso!')).toBeVisible({
    timeout: 20_000
  })

  const search = page.getByPlaceholder('Buscar produto...')

  await search.fill('KIT SH + COND VITAY NOVEX 300ML TRAT CRESPINHO')
  await expect(page.getByText('R$ 17,98')).toBeVisible()

  await search.fill('PAPEL ALUMINIO VABENE 4M 30CM 1ROLO')
  await expect(page.getByText('R$ 3,15')).toBeVisible()

  await search.fill('AMENDOIM AMENDUPA 400G JAPONES PCT')
  await expect(page.getByText('R$ 9,85')).toBeVisible()
})
