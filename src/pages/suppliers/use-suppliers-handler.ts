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

  const handleOpenCreate = () => {
    setFormSupplier(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (supplier: TSupplier) => {
    setFormSupplier(supplier)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleOpenDelete = (supplier: TSupplier) => {
    setSupplierToDelete(supplier)
  }

  const handleCloseDelete = () => {
    setSupplierToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id)
      handleCloseDelete()
    }
  }

  return {
    search,
    setSearch,
    handleOpenCreate,
    filteredSuppliers,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
    isFormOpen,
    formSupplier,
    setFormSupplier,
    supplierToDelete,
    quickCreateSeller,
    setQuickCreateSeller
  }
}
