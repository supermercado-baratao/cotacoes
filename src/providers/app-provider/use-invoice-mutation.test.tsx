import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { invoiceModel } from '@/models/invoice/model'
import { type TInvoice } from '@/models/invoice/types'
import { useAlertStore } from '@/stores/use-alert-store'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { createQueryWrapper } from '@/tests/_utils/create-query-wrapper'

import { invoicesKey } from './invoice-cache'
import { useInvoiceMutation } from './use-invoice-mutation'

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
