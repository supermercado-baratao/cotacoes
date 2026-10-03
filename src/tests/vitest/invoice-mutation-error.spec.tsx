import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { invoiceModel, type TInvoice } from '@/models'
import { invoicesKey } from '@/providers/app-provider/invoice-cache'
import { useInvoiceMutation } from '@/providers/app-provider/use-invoice-mutation'
import { useAlertStore, useAppStore, useCallbackStore } from '@/stores'

import { createQueryWrapper } from './_utils/create-query-wrapper'

beforeEach(() => {
  useAlertStore.setState({ params: null })
  useCallbackStore.setState({ queue: [] })
})

describe('useInvoiceMutation', () => {
  test('alerts and adds no invoice to the cache when the batch import fails', async () => {
    vi.spyOn(invoiceModel, 'createMany').mockRejectedValueOnce(
      new Error('network error')
    )
    const range = useAppStore.getState().invoiceDateRange

    const { queryClient, wrapper } = createQueryWrapper()
    queryClient.setQueryData(invoicesKey(range), [])
    const { result } = renderHook(() => useInvoiceMutation(), { wrapper })

    const invoice = {
      id: 'nfe-1',
      emissionDate: range.startDate,
      items: []
    } as unknown as TInvoice
    act(() => result.current.createInvoicesBatch([invoice]))

    await waitFor(() => {
      expect(useAlertStore.getState().params).toMatchObject({
        severity: 'error',
        title: 'Erro ao importar notas'
      })
    })
    expect(queryClient.getQueryData(invoicesKey(range))).toEqual([])
  })
})
