import { useMemo, useState } from 'react'

import { useAppStore } from '@/stores'

import { filterInvoices } from './utils'

export const useInvoicesHandler = () => {
  const { invoices } = useAppStore()

  const [search, setSearch] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)

  const handleImportOpen = () => setIsImportOpen(true)

  const handleImportClose = () => setIsImportOpen(false)

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
    handleImportClose
  }
}
