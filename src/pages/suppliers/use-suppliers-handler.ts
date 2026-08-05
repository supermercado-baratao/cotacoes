import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TSupplier } from '@/models'
import { useAppStore } from '@/stores'
import { isSupplierCnpjIgnored } from '@/utils'

import { filterIgnoredSuppliers, filterSuppliers } from './utils'

export type TSuppliersTab = 'registered' | 'ignored'

export const useSuppliersHandler = () => {
  const { suppliers, ignoredSuppliers } = useAppStore()
  const {
    formItem: formSupplier,
    setFormItem: setFormSupplier,
    isFormOpen,
    handleFormOpen,
    handleFormClose
  } = useFormState<TSupplier>()

  const [search, setSearch] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TSuppliersTab>('registered')

  const registeredSuppliers = useMemo(
    () =>
      (suppliers ?? []).filter(
        (s) => !isSupplierCnpjIgnored(s.cnpj, ignoredSuppliers ?? [])
      ),
    [suppliers, ignoredSuppliers]
  )

  const filteredSuppliers = useMemo(
    () => (suppliers ? filterSuppliers(search, registeredSuppliers) : null),
    [search, suppliers, registeredSuppliers]
  )

  const filteredIgnoredSuppliers = useMemo(
    () => filterIgnoredSuppliers(search, ignoredSuppliers ?? []),
    [search, ignoredSuppliers]
  )

  const isFetching = suppliers === null
  const hasSuppliers = !!registeredSuppliers.length
  const isFetchingIgnored = ignoredSuppliers === null
  const hasIgnoredSuppliers = !!ignoredSuppliers?.length

  return {
    isFetching,
    hasSuppliers,
    search,
    setSearch,
    handleFormOpen,
    filteredSuppliers,
    handleFormClose,
    isFormOpen,
    formSupplier,
    setFormSupplier,
    isImportOpen,
    handleImportOpen: () => setIsImportOpen(true),
    handleImportClose: () => setIsImportOpen(false),
    activeTab,
    setActiveTab,
    filteredIgnoredSuppliers,
    isFetchingIgnored,
    hasIgnoredSuppliers
  }
}
