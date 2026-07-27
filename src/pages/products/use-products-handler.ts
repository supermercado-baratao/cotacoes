import { useMemo, useState } from 'react'

import type { TProductDraft } from '@/components'
import { useFormState } from '@/hooks'
import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

import {
  filterProducts,
  filterUnmatchedProductItems,
  getUnmatchedProductItems,
  type TUnmatchedProductItem
} from './utils'

export type TProductsTab = 'registered' | 'unmatched'

export const useProductsHandler = () => {
  const { products, invoices } = useAppStore()
  const {
    formItem: formProduct,
    setFormItem: setFormProduct,
    isFormOpen,
    handleFormOpen: openForm,
    handleFormClose: closeForm
  } = useFormState<TProduct>()

  const [search, setSearch] = useState('')
  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [activeTab, setActiveTab] = useState<TProductsTab>('registered')
  const [productDraft, setProductDraft] = useState<TProductDraft | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const filteredProducts = useMemo(
    () => (products ? filterProducts(search, products) : null),
    [search, products]
  )

  const unmatchedItems = useMemo(
    () => getUnmatchedProductItems(invoices ?? []),
    [invoices]
  )

  const filteredUnmatchedItems = useMemo(
    () => filterUnmatchedProductItems(search, unmatchedItems),
    [search, unmatchedItems]
  )

  const isFetching = products === null
  const hasProducts = !!products?.length
  const isFetchingUnmatched = invoices === null

  const handleFormOpen = (product: TProduct | null = null) => {
    setProductDraft(null)
    openForm(product)
  }

  const handleFormClose = () => {
    setProductDraft(null)
    closeForm()
  }

  const handleCreateFromUnmatchedItem = (item: TUnmatchedProductItem) => {
    setProductDraft({
      description: item.description,
      barcode: item.barcode ?? '',
      price: item.unitPrice
    })
    openForm(null)
  }

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
    activeTab,
    setActiveTab,
    unmatchedItems: filteredUnmatchedItems,
    isFetchingUnmatched,
    hasUnmatchedItems: !!unmatchedItems.length,
    productDraft,
    handleCreateFromUnmatchedItem,
    isImportOpen,
    handleImportOpen: () => setIsImportOpen(true),
    handleImportClose: () => setIsImportOpen(false)
  }
}
