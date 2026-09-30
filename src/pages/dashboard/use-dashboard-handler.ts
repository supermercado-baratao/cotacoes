import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'

import { useAppStore } from '@/stores'
import { buildEntryCostMap } from '@/utils'

import {
  buildLastEntryDateMap,
  buildProductIdsWithEntryInRange,
  filterInvoicesByEmissionDate,
  filterMarginAlertsByEntryPeriod,
  getDashboardStats,
  getMarginAlerts,
  type TMarginCostSource
} from './utils'

const ENTRY_DATE_DEFAULT_WINDOW_DAYS = 30

export const useDashboardHandler = () => {
  const { products, quotes, invoices, suppliers, settings } = useAppStore()

  const isFetching = products === null || quotes === null || invoices === null

  const [startDate, setStartDate] = useState(() =>
    dayjs().subtract(ENTRY_DATE_DEFAULT_WINDOW_DAYS, 'day').format('YYYY-MM-DD')
  )
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [isPeriodFilterEnabled, setIsPeriodFilterEnabled] = useState(true)
  // Fonte de custo escolhida no select da coluna Custo, por produto. Só vale
  // na sessão — é uma ferramenta de análise, não altera o cadastro.
  const [costSourceOverrides, setCostSourceOverrides] = useState<
    Map<string, TMarginCostSource>
  >(() => new Map())

  const handleCostSourceChange = useCallback(
    (productId: string, source: TMarginCostSource) =>
      setCostSourceOverrides((current) =>
        new Map(current).set(productId, source)
      ),
    []
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
      getMarginAlerts(
        products ?? [],
        settings,
        lastEntryDateMap,
        entryCostMap,
        costSourceOverrides
      ),
    [products, settings, lastEntryDateMap, entryCostMap, costSourceOverrides]
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
