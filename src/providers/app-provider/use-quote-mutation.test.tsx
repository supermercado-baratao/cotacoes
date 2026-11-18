import { act, renderHook, waitFor } from '@testing-library/react'
import { Timestamp } from 'firebase/firestore'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { quoteModel } from '@/models/quote/model'
import { type TQuote } from '@/models/quote/types'
import { useAlertStore } from '@/stores/use-alert-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { createQueryWrapper } from '@/tests/_utils/create-query-wrapper'

import { useQuoteMutation } from './use-quote-mutation'

const QUOTE: TQuote = {
  id: 'quote-1',
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
  date: '2026-02-01',
  observations: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

const renderQuoteMutation = () => {
  const { queryClient, wrapper } = createQueryWrapper()
  queryClient.setQueryData(['quotes'], [QUOTE])
  const { result } = renderHook(() => useQuoteMutation(), { wrapper })
  return { queryClient, result }
}

beforeEach(() => {
  useAlertStore.setState({ params: null })
  useCallbackStore.setState({ queue: [] })
})

describe('useQuoteMutation', () => {
  test('alerts and keeps the quote when updating it fails', async () => {
    vi.spyOn(quoteModel, 'update').mockRejectedValueOnce(
      new Error('network error')
    )
    const { queryClient, result } = renderQuoteMutation()

    act(() => result.current.updateQuote({ ...QUOTE, items: [] }))

    await waitFor(() => {
      expect(useAlertStore.getState().params).toMatchObject({
        severity: 'error',
        title: 'Erro ao atualizar cotação'
      })
    })
    expect(queryClient.getQueryData(['quotes'])).toEqual([QUOTE])
  })

  test('alerts and keeps the quote when deleting it fails', async () => {
    vi.spyOn(quoteModel, 'deleteUniqueById').mockRejectedValueOnce(
      new Error('network error')
    )
    const { queryClient, result } = renderQuoteMutation()

    act(() => result.current.deleteQuote(QUOTE.id))

    await waitFor(() => {
      expect(useAlertStore.getState().params).toMatchObject({
        severity: 'error',
        title: 'Erro ao excluir cotação'
      })
    })
    expect(queryClient.getQueryData(['quotes'])).toEqual([QUOTE])
  })
})
