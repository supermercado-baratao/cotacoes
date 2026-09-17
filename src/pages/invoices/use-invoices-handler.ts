import { useMemo, useState } from 'react'

import { useAppStore } from '@/stores'

import { filterInvoices } from './utils'

export const useInvoicesHandler = () => {
  const {
    invoices,
    invoiceDateRange,
    setInvoiceDateRange,
    invoiceSearch: search,
    setInvoiceSearch: setSearch,
    settings
  } = useAppStore()

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [startDate, setStartDate] = useState(invoiceDateRange.startDate)
  const [endDate, setEndDate] = useState(invoiceDateRange.endDate)

  const handleImportOpen = () => setIsImportOpen(true)

  const handleImportClose = () => setIsImportOpen(false)

  const canSearchDateRange = !!startDate && !!endDate && startDate <= endDate

  const handleDateRangeSearch = () => {
    if (!canSearchDateRange) return
    setInvoiceDateRange({ startDate, endDate })
  }

  const filteredInvoices = useMemo(
    () => (invoices ? filterInvoices(search, invoices) : null),
    [search, invoices]
  )

  const isFetching = invoices === null
  const hasInvoices = !!invoices?.length

  return {
    isFetching,
    hasInvoices,
    search,
    setSearch,
    filteredInvoices,
    isImportOpen,
    handleImportOpen,
    handleImportClose,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    canSearchDateRange,
    handleDateRangeSearch,
    lastImportAt: settings?.lastInvoiceImportAt ?? null
  }
}
