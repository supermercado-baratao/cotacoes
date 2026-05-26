import { useState } from 'react'

import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

export const useTableHandler = () => {
  const { deleteProduct } = useAppStore()

  const [productToDelete, setProductToDelete] = useState<TProduct | null>(null)

  const handleDelete = (product: TProduct) => {
    setProductToDelete(product)
  }

  const handleDeleteDialogClose = () => {
    setProductToDelete(null)
  }

  const handleDeleteDialogConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id)
      handleDeleteDialogClose()
    }
  }

  return {
    productToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
