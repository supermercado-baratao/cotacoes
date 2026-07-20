import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, test } from 'vitest'

import { quoteModel } from '@/models'
import { useAppStore } from '@/stores'

import { createApp } from './_mocks/App'
import { databaseMock } from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { createUser, populateDatabase } from './orchestrator'

const INVOICE_XML = 'NFe29260632053743000116550020000001081299331431.xml'
const QUOTE_ITEM_ID = crypto.randomUUID()

beforeAll(async () => {
  createUser()
  await populateDatabase()

  await quoteModel.create({
    items: [
      {
        id: QUOTE_ITEM_ID,
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
})

const getFileInput = (): HTMLInputElement =>
  document.querySelector('input[type="file"]') as HTMLInputElement

const uploadXml = async (
  event: ReturnType<typeof userEvent.setup>,
  filename: string
) => {
  const buffer = await readMockFile(`xmls/${filename}`)
  const file = new File([new Uint8Array(buffer)], filename)
  await event.upload(getFileInput(), file)
}

const openImportDialog = async (event: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: 'Importar Notas' })
    ).toBeInTheDocument()
  })
  await waitFor(() => {
    expect(useAppStore.getState().products).toHaveLength(495)
  })
  await event.click(screen.getByRole('button', { name: 'Importar Notas' }))
}

describe('Invoice flow', () => {
  test('Importa uma nota fiscal mostrando o status de cadastro de produtos e fornecedor', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/invoices')
    render(<App />)

    await openImportDialog(event)
    await uploadXml(event, INVOICE_XML)

    await waitFor(() => {
      expect(screen.getByText('NF nº 108 — Série 2')).toBeInTheDocument()
    })

    expect(
      screen.getByText('NOTA 10 CONDIMENTOS E ESPECIARIAS.')
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Fornecedor não encontrado/)
    ).not.toBeInTheDocument()
    expect(screen.getByText('5/21 produtos cadastrados')).toBeInTheDocument()

    await event.click(screen.getByRole('button', { name: 'Ver itens' }))

    await waitFor(() => {
      expect(screen.getByText('PIMENTA DO REINO MOIDA 50G')).toBeInTheDocument()
    })
    expect(
      screen.getByText('PIMENTA DO REINO MOIDO NOTA 10 50G PCT')
    ).toBeInTheDocument()
    expect(screen.getAllByText('Não cadastrado').length).toBe(16)

    await event.click(screen.getByRole('button', { name: 'Importar 1 nota' }))

    await waitFor(() => {
      expect(
        screen.getByText('1 nota importada com sucesso!')
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      const invoices = useAppStore.getState().invoices ?? []
      expect(invoices.find((inv) => inv.number === '108')).toBeDefined()
    })

    expect(screen.getByText('108')).toBeInTheDocument()
    expect(screen.getByText('Cadastrado')).toBeInTheDocument()
    expect(screen.getByText('5/21')).toBeInTheDocument()
    expect(screen.getByText('0/21')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  }, 30000)

  test('Não importa novamente uma nota fiscal já existente', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/invoices')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('108')).toBeInTheDocument()
    })

    await openImportDialog(event)
    await uploadXml(event, INVOICE_XML)

    await waitFor(() => {
      expect(
        screen.getByText(
          '1 nota já foi importada anteriormente e será ignorada'
        )
      ).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Importar' })).toBeDisabled()

    await event.click(screen.getByRole('button', { name: 'Ver detalhes' }))
    expect(
      screen.getByText('29260632053743000116550020000001081299331431')
    ).toBeInTheDocument()
  }, 20000)

  test('Mostra erro ao selecionar um arquivo XML sem chave de acesso válida', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/invoices')
    render(<App />)

    await openImportDialog(event)

    const invalidXml =
      '<?xml version="1.0"?><nfeProc><NFe><infNFe><ide><nNF>1</nNF></ide></infNFe></NFe></nfeProc>'
    await event.upload(getFileInput(), new File([invalidXml], 'invalido.xml'))

    await waitFor(() => {
      expect(screen.getByText('invalido.xml:')).toBeInTheDocument()
    })
    expect(
      screen.getByText('Chave de acesso NFe inválida ou ausente no arquivo')
    ).toBeInTheDocument()

    const alert = screen.getByRole('alert')
    await event.click(within(alert).getByRole('button'))
    expect(screen.queryByText('invalido.xml:')).not.toBeInTheDocument()
  }, 20000)

  test('Vincula um item da nota a um pedido da cotação a partir da própria nota fiscal', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/invoices')
    const { unmount } = render(<App />)

    await waitFor(() => {
      expect(screen.getByText('108')).toBeInTheDocument()
    })

    await event.click(screen.getByText('108'))

    await waitFor(() => {
      expect(screen.getByText('NF nº 108 — Série 2')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('01/06/2026')).toBeInTheDocument()
    })

    expect(screen.getByText('21 sem pedido')).toBeInTheDocument()

    await event.click(screen.getByRole('button', { name: 'Vincular pedidos' }))

    const dialogTitle = await screen.findByRole('heading', {
      name: 'Vincular pedidos'
    })
    const dialog = dialogTitle.closest('.MuiPaper-root') as HTMLElement
    within(dialog).getByText('PIMENTA DO REINO MOIDA 50G')
    within(dialog).getByText('PIMENTA DO REINO')

    await event.click(
      within(dialog).getByRole('button', { name: 'Confirmar (1)' })
    )

    await waitFor(() => {
      expect(
        screen.getByText('1 pedido vinculado com sucesso!')
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('20 sem pedido')).toBeInTheDocument()
    })

    await waitFor(() => {
      const orders = useAppStore.getState().ordersByQuoteId ?? []
      const order = orders.find((o) => o.productId === '210049')
      expect(order).toBeDefined()
      expect(order?.quoteItemId).toBe(QUOTE_ITEM_ID)
      expect(order?.price).toBeCloseTo(1.8)
      expect(order?.quantity).toBe(50)
    })

    unmount()
    const { App: InvoicesApp } = createApp('/invoices')
    render(<InvoicesApp />)

    await waitFor(() => {
      expect(screen.getByText('1/21')).toBeInTheDocument()
    })
  }, 30000)

  test('Mostra erro quando falha ao importar a nota', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/invoices')
    render(<App />)

    await openImportDialog(event)

    const otherXml = 'NFe32260605997742000408550000055770841777496431.xml'
    databaseMock.createManyWithIds.mockRejectedValueOnce(
      new Error('network error')
    )

    await uploadXml(event, otherXml)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Importar 1 nota' })
      ).toBeInTheDocument()
    })
    await event.click(screen.getByRole('button', { name: 'Importar 1 nota' }))

    await waitFor(() => {
      expect(screen.getByText('Erro ao importar notas')).toBeInTheDocument()
    })

    expect(
      (useAppStore.getState().invoices ?? []).find(
        (inv) => inv.number === '108'
      )
    ).toBeDefined()
  }, 20000)
})
