import { useState } from 'react'

export const useDeleteHandler = <T extends { id: string }>(
  deleteItem: (item: T) => void
) => {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)

  const handleDelete = (item: T) => {
    setItemToDelete(item)
  }

  const handleDeleteDialogClose = () => {
    setItemToDelete(null)
  }

  const handleDeleteDialogConfirm = () => {
    if (!itemToDelete) return
    deleteItem(itemToDelete)
    handleDeleteDialogClose()
  }

  return {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
