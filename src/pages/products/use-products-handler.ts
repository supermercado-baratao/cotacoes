import { useMemo, useState } from 'react'

import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

import { filterProducts } from './utils'

export const useProductsHandler = () => {
  const { products } = useAppStore()

  const [formProduct, setFormProduct] = useState<TProduct | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
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
    handleFormClose,
    isFormOpen,
    formProduct,
    setFormProduct,
    quickCreateFamily,
    setQuickCreateFamily
  }
}
