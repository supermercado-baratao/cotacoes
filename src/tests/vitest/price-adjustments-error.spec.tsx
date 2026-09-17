import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, test } from 'vitest'

import { createApp } from './_mocks/App'
import { databaseMock } from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { createUser, populateDatabase } from './orchestrator'

const REAJUSTE_XLSX = 'price-adjustments-small.xlsx'

const getFileInput = (): HTMLInputElement =>
  document.querySelector('input[type="file"]') as HTMLInputElement

const uploadReajusteFile = async (
  event: ReturnType<typeof userEvent.setup>,
  filename: string
) => {
  const buffer = await readMockFile(filename)
  const file = new File([new Uint8Array(buffer)], filename)
  await event.upload(getFileInput(), file)
}

beforeAll(async () => {
  createUser()
  await populateDatabase()
})

describe('Price adjustments error', () => {
  test('Mostra erro e permite tentar novamente quando a busca de pedidos falha', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/price-adjustments')
    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Importar Arquivo' })
      ).toBeInTheDocument()
    })
    await event.click(screen.getByRole('button', { name: 'Importar Arquivo' }))

    databaseMock.findMany.mockRejectedValueOnce(new Error('network error'))

    await uploadReajusteFile(event, REAJUSTE_XLSX)

    await waitFor(() => {
      expect(screen.getByText('network error')).toBeInTheDocument()
    })

    await event.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      screen.getByText('Arraste e solte o arquivo de reajuste aqui')
    ).toBeInTheDocument()
  }, 15000)
})
