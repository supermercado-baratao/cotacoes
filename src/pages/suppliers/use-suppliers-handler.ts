import { useMemo, useState } from 'react'

import type { TSupplier } from '@/models'
import { useAppStore } from '@/stores'

import { filterSuppliers } from './utils'

export const useSuppliersHandler = () => {
  const { suppliers } = useAppStore()

  const [formSupplier, setFormSupplier] = useState<TSupplier | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [quickCreateSeller, setQuickCreateSeller] = useState(false)

  const filteredSuppliers = useMemo(
    () => (suppliers ? filterSuppliers(search, suppliers) : null),
    [search, suppliers]
  )

  const handleFormOpen = () => {
    setFormSupplier(null)
    setIsFormOpen(true)
  }

  const handleFormEdit = (supplier: TSupplier) => {
    setFormSupplier(supplier)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
  }

  const isFetching = suppliers === null
  const hasSuppliers = !!suppliers?.length

  return {
    isFetching,
    hasSuppliers,
    search,
    setSearch,
    handleFormOpen,
    filteredSuppliers,
    handleFormEdit,
    handleFormClose,
    isFormOpen,
    formSupplier,
    setFormSupplier,
    quickCreateSeller,
    setQuickCreateSeller
  }
}
