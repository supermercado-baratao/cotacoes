import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

import { filterProducts } from './utils'

export const useProductsHandler = () => {
  const { products } = useAppStore()
  const {
    formItem: formProduct,
    setFormItem: setFormProduct,
    isFormOpen,
    handleFormOpen,
    handleFormClose
  } = useFormState<TProduct>()

  const [search, setSearch] = useState('')
  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [quickCreateGroup, setQuickCreateGroup] = useState(false)
  const [quickCreateSupplier, setQuickCreateSupplier] = useState(false)

  const filteredProducts = useMemo(
    () => (products ? filterProducts(search, products) : null),
    [search, products]
  )

  const isFetching = products === null
  const hasProducts = !!products?.length

  return {
    isFetching,
    hasProducts,
    search,
    setSearch,
    handleFormOpen,
    filteredProducts,
    handleFormClose,
    isFormOpen,
    formProduct,
    setFormProduct,
    quickCreateFamily,
    setQuickCreateFamily,
    quickCreateGroup,
    setQuickCreateGroup,
    quickCreateSupplier,
    setQuickCreateSupplier
  }
}
