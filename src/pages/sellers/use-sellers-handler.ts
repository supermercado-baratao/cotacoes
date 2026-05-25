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
  const [quickCreateSupplier, setQuickCreateSupplier] = useState(false)

  const filteredSellers = useMemo(
    () => (sellers ? filterSellers(search, sellers) : null),
    [search, sellers]
  )

  const handleFormOpen = () => {
    setFormSeller(null)
    setIsFormOpen(true)
  }

  const handleFormEdit = (seller: TSeller) => {
    setFormSeller(seller)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
  }

  const handleDeleteDialogOpen = (seller: TSeller) => {
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

  const isFetching = sellers === null
  const hasSellers = !!sellers?.length

  return {
    isFetching,
    hasSellers,
    search,
    setSearch,
    handleFormOpen,
    filteredSellers,
    handleFormEdit,
    handleDeleteDialogOpen,
    handleFormClose,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    isFormOpen,
    formSeller,
    setFormSeller,
    sellerToDelete,
    quickCreateSupplier,
    setQuickCreateSupplier
  }
}
