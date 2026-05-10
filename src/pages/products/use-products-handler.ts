import { useState } from 'react'

import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

import { filterProducts } from './utils'

export const useProductsHandler = () => {
  const { products, deleteProduct } = useAppStore()

  const [formProduct, setFormProduct] = useState<TProduct | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<TProduct | null>(null)
  const [search, setSearch] = useState('')

  const filteredProducts = filterProducts(search, products)

  const handleOpenCreate = () => {
    setFormProduct(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (product: TProduct) => {
    setFormProduct(product)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleOpenDelete = (product: TProduct) => {
    setProductToDelete(product)
  }

  const handleCloseDelete = () => {
    setProductToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id)
      handleCloseDelete()
    }
  }

  return {
    search,
    setSearch,
    handleOpenCreate,
    filteredProducts,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
    isFormOpen,
    formProduct,
    setFormProduct,
    productToDelete
  }
}
