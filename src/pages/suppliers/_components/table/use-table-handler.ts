import { useState } from 'react'

import type { TSupplier } from '@/models'
import { useAppStore } from '@/stores'

export const useTableHandler = () => {
  const { deleteSupplier } = useAppStore()

  const [supplierToDelete, setSupplierToDelete] = useState<TSupplier | null>(
    null
  )

  const handleDelete = (supplier: TSupplier) => {
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

  return {
    supplierToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
