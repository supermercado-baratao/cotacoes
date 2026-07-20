import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import type { TOrder } from '@/models'
import { useAppStore } from '@/stores'

import { createApp } from './_mocks/App'
import {
  databaseMock,
  getSeededCollection,
  seedCollection
} from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { createUser, populateDatabase } from './orchestrator'

const QUOTE_DATE = '2026-02-01'

const seedOrderForQuoteItem = (
  quoteId: string,
  quoteItemId: string
): TOrder => {
  const order: TOrder = {
    id: crypto.randomUUID(),
    quoteId,
    quoteItemId,
    productId: '207826',
    invoiceId: null,
    price: 10,
    quantity: 1,
    packing: 'UN',
    packingQuantity: null,
    supplierId: 'fake-supplier-id',
    sellerId: null,
    date: QUOTE_DATE,
    observations: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  seedCollection('orders', [order])
  return order
}

let shortageList: string[] = []

beforeAll(async () => {
  createUser()
  await populateDatabase()

  const buffer = await readMockFile('quote-items.txt')
  shortageList = buffer
    .toString('utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
})

const getRowAction = (description: string, actionLabel: string) => {
  const cell = screen.getByText(description)
  const row = cell.closest('[role="row"]') as HTMLElement
  return within(row).getByRole('menuitem', { name: actionLabel })
}

const getHeaderAction = (actionLabel: string) => {
  const actionsBox = screen.getByRole('button', {
    name: 'Editar'
  }).parentElement as HTMLElement
  return within(actionsBox).getByRole('button', { name: actionLabel })
}

const setDate = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

const setLines = (value: string) => {
  fireEvent.change(screen.getByLabelText('Lista de faltas'), {
    target: { value }
  })
}

describe('Quote flow', () => {
  test('Creates a quote from the full shortage list', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/quotes')
    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Nova Cotação' })
      ).toBeInTheDocument()
    })

    await event.click(screen.getByRole('button', { name: 'Nova Cotação' }))

    await screen.findByLabelText('Data')
    setDate('Data', QUOTE_DATE)
    setLines(shortageList.join('\n'))

    await event.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(
        screen.getByText('Cotação criada com sucesso!')
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      const quote = (useAppStore.getState().quotes ?? []).find(
        (q) => q.date === QUOTE_DATE
      )
      expect(quote?.items).toHaveLength(shortageList.length)
    })

    expect(screen.getByText('PUDIM BRETZKE')).toBeInTheDocument()
    expect(screen.getByText('SABAO EM PO BRILHANTE 2,4KG')).toBeInTheDocument()
  }, 30000)

  test('References an item manually and the rest via AI, preserving the manual reference', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/quotes')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('PUDIM BRETZKE')).toBeInTheDocument()
    })

    await event.click(getRowAction('PUDIM BRETZKE', 'Referenciar'))

    const productInput = await screen.findByLabelText('Produto específico')
    await event.type(productInput, 'PUDIM BRETZKE 50G CHOCOLATE')
    await event.click(
      await screen.findByRole('option', {
        name: 'PUDIM BRETZKE 50G CHOCOLATE'
      })
    )

    const priceInput = screen.getByLabelText('Preço na cotação')
    await waitFor(() => expect(priceInput).toHaveValue('3,15'))
    await event.click(priceInput)
    await event.keyboard('5,00')
    await waitFor(() => expect(priceInput).toHaveValue('5,00'))

    await event.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(
        screen.getByText('Cotação atualizada com sucesso!')
      ).toBeInTheDocument()
    })

    await event.click(
      screen.getByRole('button', { name: 'Referenciar com IA' })
    )

    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: 'Aplicar 29 aceitos' })
        ).toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    expect(screen.getByText('Referenciado')).toBeInTheDocument()
    expect(screen.getByText('SAB EM PO BRILHANTE 2,4KG SH')).toBeInTheDocument()
    expect(
      screen.getByText('SH CLEAR 200ML ANTICASPA MEN CAB NER. A SECOS')
    ).toBeInTheDocument()

    await event.click(
      screen.getByRole('button', { name: 'Aplicar 29 aceitos' })
    )

    await waitFor(() => {
      expect(
        screen.getByText('Cotação atualizada com sucesso!')
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      const quote = (useAppStore.getState().quotes ?? []).find(
        (q) => q.date === QUOTE_DATE
      )
      const manual = quote?.items.find((i) => i.description === 'PUDIM BRETZKE')
      expect(manual?.priceRef).toEqual({ type: 'product', id: '207826' })
      expect(manual?.salePrice).toBe(5)

      const referenced = quote?.items.filter((i) => i.priceRef !== null)
      expect(referenced).toHaveLength(30)
    })
  }, 30000)

  test('Edits the shortage list preserving existing references', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/quotes')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('PUDIM BRETZKE')).toBeInTheDocument()
    })

    await event.click(getHeaderAction('Editar'))
    await screen.findByLabelText('Data')

    const newLines = [
      ...shortageList.filter((line) => line !== 'DETERGENTE LIMPOL'),
      'NOVO ITEM TESTE'
    ]
    setLines(newLines.join('\n'))

    await event.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(
        screen.getByText('Cotação atualizada com sucesso!')
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      const quote = (useAppStore.getState().quotes ?? []).find(
        (q) => q.date === QUOTE_DATE
      )
      expect(quote?.items).toHaveLength(30)
      expect(
        quote?.items.find((i) => i.description === 'DETERGENTE LIMPOL')
      ).toBeUndefined()

      const preserved = quote?.items.find(
        (i) => i.description === 'PUDIM BRETZKE'
      )
      expect(preserved?.priceRef).toEqual({ type: 'product', id: '207826' })
      expect(preserved?.salePrice).toBe(5)

      const created = quote?.items.find(
        (i) => i.description === 'NOVO ITEM TESTE'
      )
      expect(created?.priceRef).toBeNull()
      expect(created?.salePrice).toBeNull()
    })
  }, 30000)

  test('Removes an item from the quote and deletes its linked orders', async () => {
    const event = userEvent.setup()

    const quoteBefore = (useAppStore.getState().quotes ?? []).find(
      (q) => q.date === QUOTE_DATE
    )!
    const itemToRemove = quoteBefore.items.find(
      (i) => i.description === 'POLVILHO AZEDO'
    )!
    const orphanOrder = seedOrderForQuoteItem(quoteBefore.id, itemToRemove.id)
    const unrelatedOrder = seedOrderForQuoteItem(
      quoteBefore.id,
      quoteBefore.items.find((i) => i.description !== 'POLVILHO AZEDO')!.id
    )

    const { App } = createApp('/quotes')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('POLVILHO AZEDO')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        (useAppStore.getState().ordersByQuoteId ?? []).some(
          (o) => o.id === orphanOrder.id
        )
      ).toBe(true)
    })

    await event.click(getRowAction('POLVILHO AZEDO', 'Excluir'))

    const dialog = await screen.findByRole('dialog')
    await event.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Cotação atualizada com sucesso! 1 pedido órfão foi excluído junto.'
        )
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      const quote = (useAppStore.getState().quotes ?? []).find(
        (q) => q.date === QUOTE_DATE
      )
      expect(quote?.items).toHaveLength(29)
      expect(
        quote?.items.find((i) => i.description === 'POLVILHO AZEDO')
      ).toBeUndefined()
    })

    await waitFor(() => {
      const orders = getSeededCollection('orders')
      expect(orders.find((o) => o.id === orphanOrder.id)).toBeUndefined()
      expect(orders.find((o) => o.id === unrelatedOrder.id)).toBeDefined()
    })

    expect(screen.queryByText('POLVILHO AZEDO')).not.toBeInTheDocument()
  }, 30000)

  test('Shows an error and keeps the quote when updating it fails', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/quotes')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    })

    databaseMock.update.mockRejectedValueOnce(new Error('network error'))

    await event.click(getHeaderAction('Editar'))
    await screen.findByLabelText('Data')
    setLines([...shortageList, 'ITEM QUE NAO DEVE SER SALVO'].join('\n'))

    await event.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar cotação')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Data')).toBeInTheDocument()
    expect(
      (useAppStore.getState().quotes ?? []).find((q) => q.date === QUOTE_DATE)
        ?.items
    ).toHaveLength(29)
  }, 30000)

  test('Deletes the whole quote and its linked orders', async () => {
    const event = userEvent.setup()

    const quoteBefore = (useAppStore.getState().quotes ?? []).find(
      (q) => q.date === QUOTE_DATE
    )!
    const orphanOrderA = seedOrderForQuoteItem(
      quoteBefore.id,
      quoteBefore.items[0].id
    )
    const orphanOrderB = seedOrderForQuoteItem(
      quoteBefore.id,
      quoteBefore.items[1].id
    )

    const { App } = createApp('/quotes')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        (useAppStore.getState().ordersByQuoteId ?? []).some(
          (o) => o.id === orphanOrderA.id
        )
      ).toBe(true)
    })

    await event.click(getHeaderAction('Excluir'))

    const dialog = await screen.findByRole('dialog')
    await event.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => {
      expect(
        screen.getByText(/^Cotação excluída com sucesso! \d+ pedidos? órfãos? /)
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(useAppStore.getState().quotes).toHaveLength(0)
    })

    await waitFor(() => {
      const orders = getSeededCollection('orders')
      expect(orders.find((o) => o.id === orphanOrderA.id)).toBeUndefined()
      expect(orders.find((o) => o.id === orphanOrderB.id)).toBeUndefined()
    })

    expect(
      screen.getByText(
        'Nenhum item nesta cotação. Crie uma cotação ou adicione itens!'
      )
    ).toBeInTheDocument()
  }, 30000)

  test('Shows an error and keeps the quote when deleting it fails', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/quotes')
    render(<App />)

    await event.click(screen.getByRole('button', { name: 'Nova Cotação' }))
    await screen.findByLabelText('Data')
    setDate('Data', '2026-03-01')
    setLines('ITEM PARA TESTE DE ERRO')
    await event.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => {
      expect(
        screen.getByText('Cotação criada com sucesso!')
      ).toBeInTheDocument()
    })

    databaseMock.deleteUniqueById.mockRejectedValueOnce(
      new Error('network error')
    )

    await event.click(getHeaderAction('Excluir'))
    const dialog = await screen.findByRole('dialog')
    await event.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => {
      expect(screen.getByText('Erro ao excluir cotação')).toBeInTheDocument()
    })

    expect(
      (useAppStore.getState().quotes ?? []).find((q) => q.date === '2026-03-01')
    ).toBeDefined()
  }, 30000)
})
