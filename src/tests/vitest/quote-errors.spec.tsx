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

import type { TQuote } from '@/models'
import { useAppStore } from '@/stores'

import { createApp } from './_mocks/App'
import { databaseMock, seedCollection } from './_mocks/database'
import { createUser, populateDatabase } from './orchestrator'

const QUOTE_DATE = '2026-02-01'

const setLines = (value: string) => {
  fireEvent.change(screen.getByLabelText('Lista de faltas'), {
    target: { value }
  })
}

beforeAll(async () => {
  createUser()
  await populateDatabase()

  seedCollection('quotes', [
    {
      id: 'quote-error-update',
      items: [
        {
          id: 'item-1',
          description: 'ITEM PARA EDITAR',
          salePrice: null,
          priceRef: null
        }
      ],
      orders: [],
      status: 'opened',
      date: QUOTE_DATE,
      observations: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    } satisfies TQuote
  ])
})

describe('Quote errors', () => {
  test('Shows an error and keeps the quote when updating it fails', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/quotes')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    })

    databaseMock.update.mockRejectedValueOnce(new Error('network error'))

    await event.click(screen.getByRole('button', { name: 'Editar' }))
    await screen.findByLabelText('Data')
    setLines('ITEM QUE NAO DEVE SER SALVO')

    await event.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar cotação')).toBeInTheDocument()
    })

    expect(
      (useAppStore.getState().quotes ?? []).find(
        (q) => q.id === 'quote-error-update'
      )?.items
    ).toHaveLength(1)
  }, 30000)

  test('Shows an error and keeps the quote when deleting it fails', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/quotes')
    render(<App />)

    await event.click(screen.getByRole('button', { name: 'Nova Cotação' }))
    await screen.findByLabelText('Data')
    fireEvent.change(screen.getByLabelText('Data'), {
      target: { value: '2026-03-01' }
    })
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

    await event.click(screen.getByRole('button', { name: 'Excluir' }))
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
