import { useMemo, useState } from 'react'

import { useAppStore } from '@/stores/use-app-store'

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

  // State adjusted during render (not in useEffect) to avoid an extra render
  // flash. Keyed on the `priceAdjustments` reference with an `undefined`
  // sentinel, never equal to a real value (`null` or array), so the autofill
  // also runs when the page mounts with the data already in the store.
  const [syncedPriceAdjustments, setSyncedPriceAdjustments] = useState<
    typeof priceAdjustments | undefined
  >(undefined)
  if (priceAdjustments !== syncedPriceAdjustments) {
    setSyncedPriceAdjustments(priceAdjustments)
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

  // Matching the file against global data not loaded yet would silently yield
  // "sem cotação recente" for everything.
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

  const displayRows = useMemo(
    () =>
      filteredRows
        ? attachMarginStatus(filteredRows, products ?? [], settings)
        : null,
    [filteredRows, products, settings]
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

  const hasFamilyGroups = familyGroups.length > 0
  const hasNoFamilyRows = noFamilyRows.length > 0
  const hasUnregisteredGroups = unregisteredGroups.length > 0

  const activeTabIndex = PRICE_ADJUSTMENTS_TABS.findIndex(
    (tab) => tab.value === activeTab
  )
  const isFirstTab = activeTabIndex === 0
  const isLastTab = activeTabIndex === PRICE_ADJUSTMENTS_TABS.length - 1
  const handlePreviousTab = () =>
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
    handlePreviousTab,
    handleNextTab
  }
}
