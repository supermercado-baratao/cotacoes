import { useMemo, useState } from 'react'

import { useAppStore } from '@/stores'
import { buildRecentCostMap } from '@/utils'

import {
  attachMarginStatus,
  filterPriceAdjustmentRows,
  filterRowsByMovementDate,
  getDataDateRange,
  groupRowsByFamily
} from './utils'

export const PRICE_ADJUSTMENTS_TABS = [
  { value: 'families', label: 'Famílias de Preços' },
  { value: 'products', label: 'Produtos' },
  { value: 'unregistered', label: 'Sem cadastro' }
] as const

export type TPriceAdjustmentsTab =
  (typeof PRICE_ADJUSTMENTS_TABS)[number]['value']

export const usePriceAdjustmentsHandler = () => {
  const {
    products,
    quotes,
    invoices,
    recentInvoices,
    suppliers,
    families,
    priceAdjustments,
    settings
  } = useAppStore()

  const [search, setSearch] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeTab, setActiveTab] = useState<TPriceAdjustmentsTab>('families')

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

  const recentCostMap = useMemo(
    () => buildRecentCostMap(recentInvoices ?? []),
    [recentInvoices]
  )

  const displayRows = useMemo(
    () =>
      filteredRows
        ? attachMarginStatus(
            filteredRows,
            products ?? [],
            settings,
            recentCostMap
          )
        : null,
    [filteredRows, products, settings, recentCostMap]
  )

  const groups = useMemo(
    () =>
      displayRows
        ? groupRowsByFamily(displayRows, products ?? [], families ?? [])
        : null,
    [displayRows, products, families]
  )

  const isFetching = priceAdjustments === null || !isGlobalDataReady
  const hasRows = !!priceAdjustments?.length

  // A aba "Famílias de Preços" e a aba "Sem cadastro" reaproveitam o mesmo
  // componente de accordion (só a "Produtos", sem família, vira uma lista de
  // cards individuais) — por isso os grupos já saem separados por aba aqui.
  const familyGroups = useMemo(
    () => groups?.filter((group) => group.kind === 'family') ?? [],
    [groups]
  )
  const noFamilyRows = useMemo(
    () => groups?.find((group) => group.kind === 'no-family')?.rows ?? [],
    [groups]
  )
  const unregisteredGroups = useMemo(
    () => groups?.filter((group) => group.kind === 'unregistered') ?? [],
    [groups]
  )

  const hasFamilyGroups = !!familyGroups.length
  const hasNoFamilyRows = !!noFamilyRows.length
  const hasUnregisteredGroups = !!unregisteredGroups.length

  const activeTabIndex = PRICE_ADJUSTMENTS_TABS.findIndex(
    (tab) => tab.value === activeTab
  )
  const isFirstTab = activeTabIndex === 0
  const isLastTab = activeTabIndex === PRICE_ADJUSTMENTS_TABS.length - 1
  const handlePrevTab = () =>
    setActiveTab(PRICE_ADJUSTMENTS_TABS[activeTabIndex - 1].value)
  const handleNextTab = () =>
    setActiveTab(PRICE_ADJUSTMENTS_TABS[activeTabIndex + 1].value)

  return {
    isFetching,
    hasRows,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isImportOpen,
    handleImportOpen,
    handleImportClose,
    activeTab,
    setActiveTab,
    familyGroups,
    noFamilyRows,
    unregisteredGroups,
    hasFamilyGroups,
    hasNoFamilyRows,
    hasUnregisteredGroups,
    isFirstTab,
    isLastTab,
    handlePrevTab,
    handleNextTab
  }
}
