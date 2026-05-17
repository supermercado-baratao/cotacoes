import { useCallback, useMemo, useState } from 'react'

import type { TProduct, TProductHistoryType } from '@/models'
import { useAppStore } from '@/stores'

import { getColumns } from './columns'
import type { THistorySelection } from './types'

export const useTableHandler = () => {
  const setStoreHistorySelection = useAppStore(
    (state) => state.setHistorySelection
  )
  const setProductHistory = useAppStore((state) => state.setProductHistory)

  const [historySelection, setHistorySelection] =
    useState<THistorySelection | null>(null)

  const handleHistoryClick = useCallback(
    (product: TProduct, field: TProductHistoryType) => {
      setStoreHistorySelection({ productId: product.id, field })
      setHistorySelection({ product, field })
    },
    [setStoreHistorySelection]
  )

  const handleHistoryClose = useCallback(() => {
    setHistorySelection(null)
    setStoreHistorySelection(null)
    setProductHistory(null)
  }, [setStoreHistorySelection, setProductHistory])

  const columns = useMemo(
    () => getColumns(handleHistoryClick),
    [handleHistoryClick]
  )

  return {
    columns,
    historySelection,
    handleHistoryClose
  }
}
