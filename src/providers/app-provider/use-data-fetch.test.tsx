import { act, renderHook, waitFor } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { departmentModel } from '@/models/department/model'
import { familyModel } from '@/models/family/model'
import { ignoredProductModel } from '@/models/ignored-product/model'
import { ignoredSupplierModel } from '@/models/ignored-supplier/model'
import { invoiceModel } from '@/models/invoice/model'
import { packageBarcodeLinkModel } from '@/models/package-barcode-link/model'
import { packingDefaultModel } from '@/models/packing-default/model'
import { priceAdjustmentModel } from '@/models/price-adjustment/model'
import { productModel } from '@/models/product/model'
import { quoteModel } from '@/models/quote/model'
import { sellerModel } from '@/models/seller/model'
import { settingsModel } from '@/models/settings/model'
import { supplierModel } from '@/models/supplier/model'
import { useAuthStore } from '@/stores/use-auth-store'
import { createQueryWrapper } from '@/tests/_utils/create-query-wrapper'

import { useDataFetch } from './use-data-fetch'

beforeEach(() => {
  useAuthStore.setState({ user: { emailVerified: true } as User })
  for (const model of [
    productModel,
    ignoredProductModel,
    packageBarcodeLinkModel,
    supplierModel,
    ignoredSupplierModel,
    sellerModel,
    familyModel,
    departmentModel,
    quoteModel,
    invoiceModel,
    packingDefaultModel,
    priceAdjustmentModel
  ]) {
    vi.spyOn(model, 'findMany').mockResolvedValue([])
  }
  vi.spyOn(settingsModel, 'find').mockResolvedValue(null)
})

describe('useDataFetch', () => {
  test('exposes the firestore error code and refetches only what failed', async () => {
    vi.spyOn(productModel, 'findMany').mockRejectedValueOnce(
      new FirebaseError(
        'permission-denied',
        'Missing or insufficient permissions'
      )
    )
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useDataFetch(), { wrapper })

    await waitFor(() =>
      expect(result.current.fetchErrorCode).toBe('permission-denied')
    )
    await waitFor(() => expect(result.current.priceAdjustments).toEqual([]))
    expect(result.current.products).toBeUndefined()

    await act(() => result.current.retryFetch())

    await waitFor(() => expect(result.current.fetchErrorCode).toBeNull())
    expect(result.current.products).toEqual([])
    expect(productModel.findMany).toHaveBeenCalledTimes(2)
    expect(supplierModel.findMany).toHaveBeenCalledTimes(1)
  })

  test('falls back to an unknown code for non-firebase errors', async () => {
    vi.spyOn(productModel, 'findMany').mockRejectedValueOnce(new Error('boom'))
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useDataFetch(), { wrapper })

    await waitFor(() => expect(result.current.fetchErrorCode).toBe('unknown'))
  })
})
