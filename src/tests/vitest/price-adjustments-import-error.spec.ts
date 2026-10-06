import { act, renderHook } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { orderModel } from '@/models/order-model/model'
import { useImportDialogHandler } from '@/pages/price-adjustments/_components/import-dialog/use-import-dialog-handler'

import { readMockFile } from './_utils/read-mock-file'

const REAJUSTE_XLSX = 'price-adjustments-small.xlsx'

const DATA = { products: [], quotes: [], invoices: [], suppliers: [] }

describe('useImportDialogHandler (price adjustments)', () => {
  test('shows the error and resets when fetching the orders fails', async () => {
    vi.spyOn(orderModel, 'findManyByProductIds').mockRejectedValueOnce(
      new Error('network error')
    )
    const handleImported = vi.fn()
    const { result } = renderHook(() =>
      useImportDialogHandler(DATA, handleImported)
    )

    const buffer = await readMockFile(REAJUSTE_XLSX)
    const file = new File([new Uint8Array(buffer)], REAJUSTE_XLSX)
    await act(() => result.current.handleFileSelect(file))

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('network error')
    expect(handleImported).not.toHaveBeenCalled()

    act(() => result.current.handleReset())

    expect(result.current.status).toBe('idle')
    expect(result.current.errorMessage).toBeNull()
  })
})
