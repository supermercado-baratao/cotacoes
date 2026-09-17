import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, test } from 'vitest'

import { useAppStore } from '@/stores'

import { createApp } from './_mocks/App'
import { databaseMock } from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { createUser, populateDatabase } from './orchestrator'

const QUOTE_DIR = 'quotes/quote-3-2026-06-01-2026-07-09'

const getFileInput = (): HTMLInputElement =>
  document.querySelector('input[type="file"]') as HTMLInputElement

const uploadXml = async (
  event: ReturnType<typeof userEvent.setup>,
  filename: string
) => {
  const buffer = await readMockFile(`${QUOTE_DIR}/${filename}`)
  const file = new File([new Uint8Array(buffer)], filename)
  await event.upload(getFileInput(), file)
}

beforeAll(async () => {
  createUser()
  await populateDatabase()
})

describe('Invoice import error', () => {
  test('Mostra erro quando falha ao importar a nota', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/invoices')
    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Importar Notas' })
      ).toBeInTheDocument()
    })
    await event.click(screen.getByRole('button', { name: 'Importar Notas' }))

    const xml = 'NFe32260605997742000408550000055770841777496431.xml'
    databaseMock.createManyWithIds.mockRejectedValueOnce(
      new Error('network error')
    )

    await uploadXml(event, xml)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Importar 1 nota' })
      ).toBeInTheDocument()
    })
    await event.click(screen.getByRole('button', { name: 'Importar 1 nota' }))

    await waitFor(() => {
      expect(screen.getByText('Erro ao importar notas')).toBeInTheDocument()
    })

    expect(useAppStore.getState().invoices ?? []).toHaveLength(0)
  }, 20000)
})
