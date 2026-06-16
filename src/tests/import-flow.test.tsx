import { render, screen, waitFor, within } from '@testing-library/react'
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

    expect(screen.getByText('8 produtos')).toBeInTheDocument()
    expect(screen.getByText('4 famílias')).toBeInTheDocument()
    expect(screen.getByText('6 fornecedores')).toBeInTheDocument()
    expect(screen.getByText('214469')).toBeInTheDocument()
    expect(
      screen.getByText('ABS ALWAYS 10UN SUAVE PEQUENO C ABAS LV10 PG8')
    ).toBeInTheDocument()
    expect(screen.getByText('R$ 4,98')).toBeInTheDocument()
    expect(screen.getByText('VITORIA CONQUISTAAT')).toBeInTheDocument()
    expect(
      within(container.querySelector('.MuiDataGrid-root')!).getAllByTestId(
        'CategoryIcon'
      )
    ).toHaveLength(5)
    expect(screen.getByText('8 linhas selecionadas')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Importar 8 produtos' })
    )

    await waitFor(() => {
      expect(
        screen.getByText('Dados importados com sucesso!')
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Selecionar arquivo' })
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(useAppStore.getState().products).toHaveLength(8)
      expect(useAppStore.getState().families).toHaveLength(4)
      expect(useAppStore.getState().suppliers).toHaveLength(6)
    })
  })
})
