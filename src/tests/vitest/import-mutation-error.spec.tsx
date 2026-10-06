import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { importModel } from '@/models/import-model/model'
import { type TImportData } from '@/models/import-model/types'
import { type TProduct } from '@/models/product-model/types'
import { useImportMutation } from '@/providers/app-provider/use-import-mutation'
import { useAlertStore } from '@/stores/use-alert-store'
import { useCallbackStore } from '@/stores/use-callback-store'

import { createQueryWrapper } from './_utils/create-query-wrapper'

const PRODUCTS = [{ id: '217823', price: 17.58 }] as TProduct[]

const IMPORT_DATA = {
  families: [],
  departments: [],
  suppliers: [],
  products: [{ ...PRODUCTS[0], price: 17.98 }]
} as unknown as TImportData

beforeEach(() => {
  useAlertStore.setState({ params: null })
  useCallbackStore.setState({ queue: [] })
})

describe('useImportMutation', () => {
  test('alerts, runs the error callbacks and keeps the cache when the import fails', async () => {
    vi.spyOn(importModel, 'import').mockRejectedValueOnce(
      new Error('network error')
    )
    const successCallback = vi.fn()
    const errorCallback = vi.fn()
    useCallbackStore.getState().setSuccessCallbacks([successCallback])
    useCallbackStore.getState().setErrorCallbacks([errorCallback])

    const { queryClient, wrapper } = createQueryWrapper()
    queryClient.setQueryData(['products'], PRODUCTS)
    const { result } = renderHook(() => useImportMutation(), { wrapper })

    act(() => result.current.importData(IMPORT_DATA))

    await waitFor(() => {
      expect(useAlertStore.getState().params).toMatchObject({
        severity: 'error',
        title: 'Erro ao importar dados'
      })
    })
    expect(errorCallback).toHaveBeenCalledOnce()
    expect(successCallback).not.toHaveBeenCalled()
    expect(useCallbackStore.getState().queue).toEqual([])
    expect(queryClient.getQueryData(['products'])).toEqual(PRODUCTS)
  })
})
