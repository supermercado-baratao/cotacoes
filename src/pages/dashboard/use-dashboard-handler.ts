import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'

import type { TMarginCostSource } from '@/models/product/types'
import { useAppStore } from '@/stores/use-app-store'
import { buildEntryCostMap } from '@/utils/entry-cost'

import {
  buildLastEntryDateMap,
  buildProductIdsWithEntryInRange,
  filterInvoicesByEmissionDate,
  filterMarginAlertsByEntryPeriod,
  getDashboardStats,
  getMarginAlerts,
  type TMarginAlert
} from './utils'

const ENTRY_DATE_DEFAULT_WINDOW_DAYS = 30

export const useDashboardHandler = () => {
  const {
    products,
    quotes,
    invoices,
    suppliers,
    packingDefaults,
    settings,
    updateProduct
  } = useAppStore()

  const isFetching = products === null || quotes === null || invoices === null

  const [startDate, setStartDate] = useState(() =>
    dayjs().subtract(ENTRY_DATE_DEFAULT_WINDOW_DAYS, 'day').format('YYYY-MM-DD')
  )
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [isPeriodFilterEnabled, setIsPeriodFilterEnabled] = useState(true)

  // Going back to the default stores `null`, so the fallback (VR -> invoice
  // average) follows the VR gaining or losing a cost later.
  const handleCostSourceChange = useCallback(
    (alert: TMarginAlert, source: TMarginCostSource) => {
      const product = products?.find((item) => item.id === alert.id)
      if (!product) return
      updateProduct({
        ...product,
        marginCostSource: source === alert.defaultCostSource ? null : source
      })
    },
    [products, updateProduct]
  )

  const lastEntryDateMap = useMemo(
    () => buildLastEntryDateMap(invoices ?? []),
    [invoices]
  )

  const activeDateRange = useMemo(() => {
    if (!isPeriodFilterEnabled) return null
    return startDate && endDate && startDate <= endDate
      ? { startDate, endDate }
      : null
  }, [isPeriodFilterEnabled, startDate, endDate])

  const entryCostMap = useMemo(
    () =>
      buildEntryCostMap(
        filterInvoicesByEmissionDate(invoices ?? [], activeDateRange),
        products ?? [],
        suppliers ?? [],
        packingDefaults ?? []
      ),
    [invoices, products, suppliers, packingDefaults, activeDateRange]
  )

  const marginAlerts = useMemo(
    () =>
      getMarginAlerts(products ?? [], settings, lastEntryDateMap, entryCostMap),
    [products, settings, lastEntryDateMap, entryCostMap]
  )

  const filteredMarginAlerts = useMemo(() => {
    if (!activeDateRange) return marginAlerts

    const productIdsInPeriod = buildProductIdsWithEntryInRange(
      invoices ?? [],
      activeDateRange
    )
    return filterMarginAlertsByEntryPeriod(marginAlerts, productIdsInPeriod)
  }, [marginAlerts, invoices, activeDateRange])

  const stats = useMemo(
    () =>
      getDashboardStats(
        products ?? [],
        quotes ?? [],
        invoices ?? [],
        filteredMarginAlerts
      ),
    [products, quotes, invoices, filteredMarginAlerts]
  )

  return {
    isFetching,
    stats,
    marginAlerts: filteredMarginAlerts,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isPeriodFilterEnabled,
    setIsPeriodFilterEnabled,
    activeDateRange,
    handleCostSourceChange
  }
}
