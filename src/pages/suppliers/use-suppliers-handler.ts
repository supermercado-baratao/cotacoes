import { useMemo, useState } from 'react'

import type { TSupplier } from '@/models'
import { useAppStore } from '@/stores'

import { filterSuppliers } from './utils'

export const useSuppliersHandler = () => {
  const { suppliers, deleteSupplier } = useAppStore()

  const [formSupplier, setFormSupplier] = useState<TSupplier | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<TSupplier | null>(
    null
  )
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

  const handleDeleteDialogOpen = (supplier: TSupplier) => {
    setSupplierToDelete(supplier)
  }

  const handleDeleteDialogClose = () => {
    setSupplierToDelete(null)
  }

  const handleDeleteDialogConfirm = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id)
      handleDeleteDialogClose()
    }
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
    handleDeleteDialogOpen,
    handleFormClose,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    isFormOpen,
    formSupplier,
    setFormSupplier,
    supplierToDelete,
    quickCreateSeller,
    setQuickCreateSeller
  }
}
