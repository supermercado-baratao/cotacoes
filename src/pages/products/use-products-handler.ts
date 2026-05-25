import { useMemo, useState } from 'react'

import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

import { filterProducts } from './utils'

export const useProductsHandler = () => {
  const { products, deleteProduct } = useAppStore()

  const [formProduct, setFormProduct] = useState<TProduct | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<TProduct | null>(null)
  const [search, setSearch] = useState('')
  const [quickCreateFamily, setQuickCreateFamily] = useState(false)

  const filteredProducts = useMemo(
    () => (products ? filterProducts(search, products) : null),
    [search, products]
  )

  const handleFormOpen = () => {
    setFormProduct(null)
    setIsFormOpen(true)
  }

  const handleFormEdit = (product: TProduct) => {
    setFormProduct(product)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
  }

  const handleDeleteDialogOpen = (product: TProduct) => {
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

  const isFetching = products === null
  const hasProducts = !!products?.length

  return {
    isFetching,
    hasProducts,
    search,
    setSearch,
    handleFormOpen,
    filteredProducts,
    handleFormEdit,
    handleDeleteDialogOpen,
    handleFormClose,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    isFormOpen,
    formProduct,
    setFormProduct,
    productToDelete,
    quickCreateFamily,
    setQuickCreateFamily
  }
}
