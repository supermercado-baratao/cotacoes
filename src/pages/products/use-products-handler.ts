import { useMemo, useState } from 'react'

import type { TProductDraft } from '@/components/blocks/product-form'
import { useFormState } from '@/hooks/use-form-state'
import type { TProduct } from '@/models/product-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { buildPackageBarcodeLinkMap } from '@/utils/package-barcode-links'
import { isSupplierCnpjIgnored } from '@/utils/suppliers'

import {
  attachProductMarginStatus,
  buildIgnoredProductRows,
  filterIgnoredProducts,
  filterProducts,
  filterUnmatchedProductItems,
  getUnmatchedProductIgnoreKey,
  getUnmatchedProductItems,
  isProductIgnored,
  isUnmatchedItemIgnored,
  type TUnmatchedProductItem
} from './utils'

export type TProductsTab = 'registered' | 'unmatched' | 'ignored'

export const useProductsHandler = () => {
  const {
    products,
    invoices,
    ignoredProducts,
    ignoredSuppliers,
    packageBarcodeLinks,
    settings,
    createIgnoredProduct,
    createPackageBarcodeLink
  } = useAppStore()
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
  const [itemToAssociate, setItemToAssociate] =
    useState<TUnmatchedProductItem | null>(null)

  const packageBarcodeLinkMap = useMemo(
    () => buildPackageBarcodeLinkMap(packageBarcodeLinks ?? []),
    [packageBarcodeLinks]
  )

  const registeredProducts = useMemo(
    () =>
      (products ?? []).filter(
        (p) => !isProductIgnored(p.id, ignoredProducts ?? [])
      ),
    [products, ignoredProducts]
  )

  const searchedProducts = useMemo(
    () => (products ? filterProducts(search, registeredProducts) : null),
    [search, products, registeredProducts]
  )

  const filteredProducts = useMemo(
    () =>
      searchedProducts
        ? attachProductMarginStatus(searchedProducts, settings)
        : null,
    [searchedProducts, settings]
  )

  const unmatchedItems = useMemo(() => {
    const allItems = getUnmatchedProductItems(invoices ?? [])
    return allItems.filter(
      (item) =>
        !isUnmatchedItemIgnored(item, ignoredProducts ?? []) &&
        !isSupplierCnpjIgnored(item.supplierCnpj, ignoredSuppliers ?? []) &&
        !(item.packageBarcode && packageBarcodeLinkMap.has(item.packageBarcode))
    )
  }, [invoices, ignoredProducts, ignoredSuppliers, packageBarcodeLinkMap])

  const filteredUnmatchedItems = useMemo(
    () => filterUnmatchedProductItems(search, unmatchedItems),
    [search, unmatchedItems]
  )

  const ignoredProductRows = useMemo(
    () =>
      buildIgnoredProductRows(
        ignoredProducts ?? [],
        invoices ?? [],
        ignoredSuppliers ?? []
      ),
    [ignoredProducts, invoices, ignoredSuppliers]
  )

  const filteredIgnoredProducts = useMemo(
    () => filterIgnoredProducts(search, ignoredProductRows),
    [search, ignoredProductRows]
  )

  const isFetching = products === null
  const hasProducts = !!registeredProducts.length
  const isFetchingUnmatched = invoices === null
  const isFetchingIgnored = ignoredProducts === null
  const hasIgnoredProducts = !!ignoredProductRows.length

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

  const handleIgnoreUnmatchedItem = (item: TUnmatchedProductItem) => {
    createIgnoredProduct({
      id: getUnmatchedProductIgnoreKey(item.barcode, item.description),
      barcode: item.barcode,
      description: item.description
    })
  }

  const handleAssociateOpen = (item: TUnmatchedProductItem) =>
    setItemToAssociate(item)

  const handleAssociateClose = () => setItemToAssociate(null)

  const handleAssociateConfirm = (product: TProduct) => {
    if (!itemToAssociate?.packageBarcode) return
    createPackageBarcodeLink({
      id: itemToAssociate.packageBarcode,
      packageBarcode: itemToAssociate.packageBarcode,
      productId: product.id
    })
    setItemToAssociate(null)
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
    handleIgnoreUnmatchedItem,
    isImportOpen,
    handleImportOpen: () => setIsImportOpen(true),
    handleImportClose: () => setIsImportOpen(false),
    ignoredProducts: filteredIgnoredProducts,
    isFetchingIgnored,
    hasIgnoredProducts,
    itemToAssociate,
    handleAssociateOpen,
    handleAssociateClose,
    handleAssociateConfirm,
    registeredProducts
  }
}
