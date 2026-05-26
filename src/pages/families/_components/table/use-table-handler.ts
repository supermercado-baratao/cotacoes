import { useState } from 'react'

import type { TFamily } from '@/models'
import { useAppStore } from '@/stores'

export const useTableHandler = () => {
  const { deleteFamily } = useAppStore()

  const [familyToDelete, setFamilyToDelete] = useState<TFamily | null>(null)

  const handleDelete = (family: TFamily) => {
    setFamilyToDelete(family)
  }

  const handleDeleteDialogClose = () => {
    setFamilyToDelete(null)
  }

  const handleDeleteDialogConfirm = () => {
    if (familyToDelete) {
      deleteFamily(familyToDelete.id)
      handleDeleteDialogClose()
    }
  }

  return {
    familyToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
