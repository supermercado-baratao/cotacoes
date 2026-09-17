import { useMemo } from 'react'

import { useAppStore } from '@/stores'
import { buildRecentCostMap } from '@/utils'

import { getDashboardStats, getMarginAlerts } from './utils'

export const useDashboardHandler = () => {
  const { products, quotes, invoices, recentInvoices, settings } = useAppStore()

  const isFetching = products === null || quotes === null || invoices === null

  const recentCostMap = useMemo(
    () => buildRecentCostMap(recentInvoices ?? []),
    [recentInvoices]
  )

  const marginAlerts = useMemo(
    () => getMarginAlerts(products ?? [], recentCostMap, settings),
    [products, recentCostMap, settings]
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
