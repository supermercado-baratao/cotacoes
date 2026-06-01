import { useState } from 'react'

export const useDeleteHandler = <T extends { id: string }>(
  deleteFn: (item: T) => void
) => {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)

  const handleDelete = (item: T) => {
    setItemToDelete(item)
  }

  const handleDeleteDialogClose = () => {
    setItemToDelete(null)
  }

  const handleDeleteDialogConfirm = () => {
    if (itemToDelete) {
      deleteFn(itemToDelete)
      handleDeleteDialogClose()
    }
  }

  return {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
