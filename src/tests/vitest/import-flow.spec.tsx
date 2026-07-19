import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, test } from 'vitest'

import { useAppStore } from '@/stores'

import { createApp } from './_mocks/App'
import { databaseMock } from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { signInFakeUser } from './_utils/seed-app'

beforeAll(() => {
  signInFakeUser()
})

const uploadFile = async (
  container: HTMLElement,
  event: ReturnType<typeof userEvent.setup>,
  filename: string
) => {
  const buffer = await readMockFile(filename)
  const file = new File([new Uint8Array(buffer)], filename)
  const input = container.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement
  await event.upload(input, file)
}

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

    await uploadFile(container, event, 'import-data.xlsx')

    await waitFor(() => {
      expect(screen.getByText('import-data.xlsx')).toBeInTheDocument()
    })

    expect(screen.getByText('495 produtos')).toBeInTheDocument()
    expect(screen.getByText('232 famílias')).toBeInTheDocument()
    expect(screen.getByText('78 fornecedores')).toBeInTheDocument()
    expect(screen.getByText('207826')).toBeInTheDocument()
    expect(screen.getByText('PUDIM BRETZKE 50G CHOCOLATE')).toBeInTheDocument()
    expect(screen.getByText('R$ 3,15')).toBeInTheDocument()
    expect(screen.getByText('PUDIM BRETZKE 50G')).toBeInTheDocument()
    expect(screen.getByText('495 linhas selecionadas')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Importar 495 produtos' })
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
        expect(useAppStore.getState().products).toHaveLength(495)
        expect(useAppStore.getState().families).toHaveLength(232)
        expect(useAppStore.getState().suppliers).toHaveLength(78)
      },
      { timeout: 10000 }
    )
  }, 20000)

  test('Reimporting a file only selects changed products', async () => {
    const event = userEvent.setup()

    const { App } = createApp('/import')
    const { container } = render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Selecionar arquivo' })
      ).toBeInTheDocument()
    })

    await uploadFile(container, event, 'edited-import-data.xlsx')

    await waitFor(() => {
      expect(screen.getByText('edited-import-data.xlsx')).toBeInTheDocument()
    })

    expect(screen.getByText('10 produtos')).toBeInTheDocument()
    expect(screen.getByText('5 famílias')).toBeInTheDocument()
    expect(screen.getByText('8 fornecedores')).toBeInTheDocument()
    expect(screen.getByText('7 sem alterações')).toBeInTheDocument()
    expect(screen.getByText('3 linhas selecionadas')).toBeInTheDocument()
    expect(screen.getAllByText('Alterado')).toHaveLength(3)
    expect(screen.getAllByText('Sem alteração')).toHaveLength(7)

    await userEvent.click(
      screen.getByRole('button', { name: 'Importar 3 produtos' })
    )

    await waitFor(
      () => {
        expect(
          screen.getByText('Dados importados com sucesso!')
        ).toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    await waitFor(
      () => {
        const products = useAppStore.getState().products ?? []
        expect(products).toHaveLength(495)
        expect(products.find((p) => p.id === '217823')?.price).toBeCloseTo(
          17.98
        )
        expect(products.find((p) => p.id === '218301')?.price).toBeCloseTo(3.15)
        expect(products.find((p) => p.id === '210524')?.price).toBeCloseTo(9.85)
      },
      { timeout: 10000 }
    )
  }, 40000)

  test('Shows an error and keeps previous data when the import fails', async () => {
    const event = userEvent.setup()

    const { App } = createApp('/import')
    const { container } = render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Selecionar arquivo' })
      ).toBeInTheDocument()
    })

    await uploadFile(container, event, 'import-data.xlsx')

    await waitFor(() => {
      expect(screen.getByText('import-data.xlsx')).toBeInTheDocument()
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
    expect(products.find((p) => p.id === '217823')?.price).toBeCloseTo(17.98)
  }, 20000)
})
