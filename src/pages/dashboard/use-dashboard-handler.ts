import { useMemo } from 'react'

import { useAppStore } from '@/stores'

import { getDashboardStats, getMarginAlerts } from './utils'

export const useDashboardHandler = () => {
  const { products, quotes, invoices, priceAdjustments, settings } =
    useAppStore()

  const isFetching =
    products === null ||
    quotes === null ||
    invoices === null ||
    priceAdjustments === null

  const marginAlerts = useMemo(
    () => getMarginAlerts(products ?? [], priceAdjustments ?? [], settings),
    [products, priceAdjustments, settings]
  )

  const stats = useMemo(
    () =>
      getDashboardStats(
        products ?? [],
        quotes ?? [],
        invoices ?? [],
        marginAlerts
      ),
    [products, quotes, invoices, marginAlerts]
  )

  return { isFetching, stats, marginAlerts }
}
