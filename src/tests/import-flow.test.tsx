import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, test } from 'vitest'

import { useAppStore, useAuthStore } from '@/stores'

import { createApp } from './_mocks/App'
import { readMockFile } from './_utils/read-mock-file'
import orchestrator from './orchestrator'

beforeAll(async () => {
  const user = await orchestrator.createUser()
  useAuthStore.getState().setUser(user)
})

describe('Import flow', () => {
  test('For empty database', async () => {
    const event = userEvent.setup()

    const { App } = createApp('/import')
    const { container } = render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Selecionar arquivo' })
      ).toBeInTheDocument()
    })

    const buffer = await readMockFile('import-data.xlsx')
    const file = new File([new Uint8Array(buffer)], 'import-data.xlsx')

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    await event.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('import-data.xlsx')).toBeInTheDocument()
    })

    expect(screen.getByText('100 produtos')).toBeInTheDocument()
    expect(screen.getByText('57 famílias')).toBeInTheDocument()
    expect(screen.getByText('43 fornecedores')).toBeInTheDocument()
    expect(screen.getByText('207826')).toBeInTheDocument()
    expect(screen.getByText('PUDIM BRETZKE 50G CHOCOLATE')).toBeInTheDocument()
    expect(screen.getByText('R$ 3,15')).toBeInTheDocument()
    expect(screen.getByText('PUDIM BRETZKE 50G')).toBeInTheDocument()
    expect(screen.getByText('100 linhas selecionadas')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Importar 100 produtos' })
    )

    await waitFor(
      () => {
        expect(
          screen.getByText('Dados importados com sucesso!')
        ).toBeInTheDocument()
      },
      { timeout: 10000 }
    )
    expect(
      screen.getByRole('button', { name: 'Selecionar arquivo' })
    ).toBeInTheDocument()

    await waitFor(
      () => {
        expect(useAppStore.getState().products).toHaveLength(100)
        expect(useAppStore.getState().families).toHaveLength(57)
        expect(useAppStore.getState().suppliers).toHaveLength(43)
      },
      { timeout: 10000 }
    )
  }, 20000)
})
