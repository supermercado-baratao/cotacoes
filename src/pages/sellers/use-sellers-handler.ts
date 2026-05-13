import { useMemo, useState } from 'react'

import type { TSeller } from '@/models'
import { useAppStore } from '@/stores'

import { filterSellers } from './utils'

export const useSellersHandler = () => {
  const { sellers, deleteSeller } = useAppStore()

  const [formSeller, setFormSeller] = useState<TSeller | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [sellerToDelete, setSellerToDelete] = useState<TSeller | null>(null)
  const [search, setSearch] = useState('')

  const filteredSellers = useMemo(
    () => (sellers ? filterSellers(search, sellers) : null),
    [search, sellers]
  )

  const handleOpenCreate = () => {
    setFormSeller(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (seller: TSeller) => {
    setFormSeller(seller)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleOpenDelete = (seller: TSeller) => {
    setSellerToDelete(seller)
  }

  const handleCloseDelete = () => {
    setSellerToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (sellerToDelete) {
      deleteSeller(sellerToDelete.id)
      handleCloseDelete()
    }
  }

  return {
    search,
    setSearch,
    handleOpenCreate,
    filteredSellers,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
    isFormOpen,
    formSeller,
    setFormSeller,
    sellerToDelete
  }
}
