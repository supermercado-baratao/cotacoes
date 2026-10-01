import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'

import type { TMarginCostSource } from '@/models'
import { useAppStore } from '@/stores'
import { buildEntryCostMap } from '@/utils'

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
  const { products, quotes, invoices, suppliers, settings, updateProduct } =
    useAppStore()

  const isFetching = products === null || quotes === null || invoices === null

  const [startDate, setStartDate] = useState(() =>
    dayjs().subtract(ENTRY_DATE_DEFAULT_WINDOW_DAYS, 'day').format('YYYY-MM-DD')
  )
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [isPeriodFilterEnabled, setIsPeriodFilterEnabled] = useState(true)

  // Fonte de custo escolhida no select da coluna Custo — salva no produto, pra
  // valer em outras sessões. Voltar pro padrão grava `null`, pra seguir o
  // fallback (VR → médio das notas) se o VR ganhar/perder custo depois. A
  // margem é recalculada quando a query de produtos é invalidada.
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

  // Custo médio de entrada só com as notas do período ativo — o mesmo
  // período que decide quais alertas aparecem.
  const entryCostMap = useMemo(
    () =>
      buildEntryCostMap(
        filterInvoicesByEmissionDate(invoices ?? [], activeDateRange),
        products ?? [],
        suppliers ?? []
      ),
    [invoices, products, suppliers, activeDateRange]
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
