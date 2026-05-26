import { useState } from 'react'

import type { TSeller } from '@/models'
import { useAppStore } from '@/stores'

export const useTableHandler = () => {
  const { deleteSeller } = useAppStore()

  const [sellerToDelete, setSellerToDelete] = useState<TSeller | null>(null)

  const handleDelete = (seller: TSeller) => {
    setSellerToDelete(seller)
  }

  const handleDeleteDialogClose = () => {
    setSellerToDelete(null)
  }

  const handleDeleteDialogConfirm = () => {
    if (sellerToDelete) {
      deleteSeller(sellerToDelete.id)
      handleDeleteDialogClose()
    }
  }

  return {
    sellerToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
