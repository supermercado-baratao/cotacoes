import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { path, trackedFields } from './constants'
import {
  type TProduct,
  type TProductHistory,
  type TProductHistoryType
} from './types'

const fieldToLastKey: Record<
  TProductHistoryType,
  keyof Pick<TProduct, 'lastPrice' | 'lastPurchasePrice' | 'lastQuantity'>
> = {
  price: 'lastPrice',
  purchasePrice: 'lastPurchasePrice',
  quantity: 'lastQuantity'
}

export const getHistoryPath = (productId: string) =>
  `${path}/${productId}/price-history`

export const processProductUpdate = (
  current: TProduct,
  incoming: TUpdateData<TProduct>
): {
  histories: TCreateData<TProductHistory>[]
  updated: TUpdateData<TProduct>
} | null => {
  const histories: TCreateData<TProductHistory>[] = []
  const lastValues: Partial<
    Pick<TProduct, 'lastPrice' | 'lastPurchasePrice' | 'lastQuantity'>
  > = {}

  for (const field of trackedFields) {
    if (current[field] !== incoming[field]) {
      histories.push({
        type: field,
        oldValue: current[field],
        newValue: incoming[field]
      })
      lastValues[fieldToLastKey[field]] = current[field]
    }
  }

  if (!histories.length) return null

  return {
    histories,
    updated: { ...incoming, ...lastValues } as TUpdateData<TProduct>
  }
}

export const createHistory = async (
  data: TCreateData<TProductHistory> & { id: string }
): Promise<TProductHistory> => {
  const { id, type, oldValue, newValue } = data
  return database.create<TProductHistory>({
    path: getHistoryPath(id),
    data: { type, oldValue, newValue }
  })
}
