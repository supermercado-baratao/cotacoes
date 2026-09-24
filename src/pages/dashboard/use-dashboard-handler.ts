import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { useAppStore } from '@/stores'

import {
  buildLastEntryDateMap,
  buildProductIdsWithEntryInRange,
  filterMarginAlertsByEntryPeriod,
  getDashboardStats,
  getMarginAlerts
} from './utils'

const ENTRY_DATE_DEFAULT_WINDOW_DAYS = 30

export const useDashboardHandler = () => {
  const { products, quotes, invoices, settings } = useAppStore()

  const isFetching = products === null || quotes === null || invoices === null

  const [startDate, setStartDate] = useState(() =>
    dayjs().subtract(ENTRY_DATE_DEFAULT_WINDOW_DAYS, 'day').format('YYYY-MM-DD')
  )
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [isPeriodFilterEnabled, setIsPeriodFilterEnabled] = useState(true)

  const lastEntryDateMap = useMemo(
    () => buildLastEntryDateMap(invoices ?? []),
    [invoices]
  )

  const marginAlerts = useMemo(
    () => getMarginAlerts(products ?? [], settings, lastEntryDateMap),
    [products, settings, lastEntryDateMap]
  )

  // `null` significa "sem restrição de período" — filtro desligado pelo
  // usuário ou intervalo inválido. Também é o valor passado pro drawer "Ver
  // notas" de cada alerta, pra manter a mesma noção de período em toda a
  // tela.
  const activeDateRange = useMemo(() => {
    if (!isPeriodFilterEnabled) return null
    return startDate && endDate && startDate <= endDate
      ? { startDate, endDate }
      : null
  }, [isPeriodFilterEnabled, startDate, endDate])

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
    activeDateRange
  }
}
