import { useMemo, useState } from 'react'

import { useAppStore } from '@/stores'

import {
  filterPriceAdjustmentRows,
  filterRowsByMovementDate,
  getDataDateRange,
  groupRowsByFamily
} from './utils'

export const usePriceAdjustmentsHandler = () => {
  const { products, quotes, invoices, suppliers, families, priceAdjustments } =
    useAppStore()

  const [search, setSearch] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const dataDateRange = useMemo(
    () => getDataDateRange(priceAdjustments ?? []),
    [priceAdjustments]
  )

  // Preenche o filtro com a menor/maior Data Movimento encontrada nos dados
  // assim que carrega (uma vez por conjunto de dados novo) — o usuário pode
  // estreitar depois. Ajuste de estado durante o render (não em useEffect)
  // evita o flash de um render extra; `dataDateRange` só muda de referência
  // quando `priceAdjustments` muda (useMemo acima), então não entra em loop.
  const [prevDataDateRange, setPrevDataDateRange] = useState(dataDateRange)
  if (dataDateRange !== prevDataDateRange) {
    setPrevDataDateRange(dataDateRange)
    if (dataDateRange) {
      setStartDate(dataDateRange.startDate)
      setEndDate(dataDateRange.endDate)
    }
  }

  const isGlobalDataReady =
    products !== null &&
    quotes !== null &&
    invoices !== null &&
    suppliers !== null &&
    families !== null

  // Evita cruzar o arquivo contra dados globais ainda não carregados
  // (produziria "sem cotação recente" para tudo, silenciosamente errado).
  const handleImportOpen = () => {
    if (isGlobalDataReady) setIsImportOpen(true)
  }
  const handleImportClose = () => setIsImportOpen(false)

  const filteredRows = useMemo(() => {
    if (!priceAdjustments) return null
    const dateFilter =
      startDate && endDate && startDate <= endDate
        ? { startDate, endDate }
        : null
    const byDate = filterRowsByMovementDate(priceAdjustments, dateFilter)
    return filterPriceAdjustmentRows(search, byDate)
  }, [search, priceAdjustments, startDate, endDate])

  const groups = useMemo(
    () =>
      filteredRows
        ? groupRowsByFamily(filteredRows, products ?? [], families ?? [])
        : null,
    [filteredRows, products, families]
  )

  const isFetching = priceAdjustments === null || !isGlobalDataReady
  const hasRows = !!priceAdjustments?.length

  return {
    isFetching,
    hasRows,
    search,
    setSearch,
    groups,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isImportOpen,
    handleImportOpen,
    handleImportClose
  }
}
