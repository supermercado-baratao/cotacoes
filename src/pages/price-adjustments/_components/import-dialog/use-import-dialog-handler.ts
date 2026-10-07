import { useState } from 'react'

import type { TInvoice } from '@/models/invoice-model/types'
import { orderModel } from '@/models/order-model/model'
import type { TProduct } from '@/models/product-model/types'
import type { TQuote } from '@/models/quote-model/types'
import type { TSupplier } from '@/models/supplier-model/types'
import { useAppStore } from '@/stores/use-app-store'

import {
  crossReferenceRows,
  getFileRows,
  getProductPriceUpdates,
  toPersistedPriceAdjustments
} from '../../utils'

type TStatus = 'idle' | 'processing' | 'error'

type TCrossReferenceData = {
  products: TProduct[]
  quotes: TQuote[]
  invoices: TInvoice[]
  suppliers: TSupplier[]
}

export const useImportDialogHandler = (
  data: TCrossReferenceData,
  onImported: () => void
) => {
  const { updateProductsBatch, replacePriceAdjustments } = useAppStore()
  const [status, setStatus] = useState<TStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setStatus('processing')
    setErrorMessage(null)
    try {
      const fileRows = await getFileRows(file)
      const orders = await orderModel.findManyByProductIds(
        fileRows.map((row) => row.code)
      )
      const rows = crossReferenceRows(
        fileRows,
        data.products,
        orders,
        data.quotes,
        data.invoices,
        data.suppliers
      )

      const productUpdates = getProductPriceUpdates(fileRows, data.products)
      if (productUpdates.length > 0) updateProductsBatch(productUpdates)

      replacePriceAdjustments(toPersistedPriceAdjustments(rows))

      onImported()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível processar o arquivo.'
      )
      setStatus('error')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setErrorMessage(null)
  }

  return { status, errorMessage, handleFileSelect, handleReset }
}
