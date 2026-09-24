import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, test } from 'vitest'

import { useAppStore } from '@/stores'

import { createApp } from './_mocks/App'
import { databaseMock } from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { createUser, populateDatabase } from './orchestrator'

beforeAll(async () => {
  createUser()
  await populateDatabase()
})

const uploadFile = async (
  event: ReturnType<typeof userEvent.setup>,
  filename: string
) => {
  const buffer = await readMockFile(filename)
  const file = new File([new Uint8Array(buffer)], filename)
  const input = document.body.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement
  await event.upload(input, file)
}

describe('Import flow', () => {
  test('Shows an error and keeps previous data when the import fails', async () => {
    const event = userEvent.setup()

    const { App } = createApp('/products')
    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Importar' })
      ).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Importar' }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Selecionar arquivo' })
      ).toBeInTheDocument()
    })

    await uploadFile(event, 'edited-import-data.xlsx')

    await waitFor(() => {
      expect(screen.getByText('edited-import-data.xlsx')).toBeInTheDocument()
    })

    databaseMock.upsertManyWithIds.mockRejectedValueOnce(
      new Error('network error')
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Importar 3 produtos' })
    )

    await waitFor(() => {
      expect(screen.getByText('Erro ao importar dados')).toBeInTheDocument()
    })

    const products = useAppStore.getState().products ?? []
    expect(products).toHaveLength(495)
    // O upsert falhou, então o preço permanece o original (import-data.xlsx),
    // não o que edited-import-data.xlsx tentou gravar (17.98).
    expect(products.find((p) => p.id === '217823')?.price).toBeCloseTo(17.58)
  }, 40000)
})
