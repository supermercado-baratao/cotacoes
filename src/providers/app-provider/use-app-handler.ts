import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

import { useAppStore } from '@/stores/use-app-store'

import { useDataFetch } from './use-data-fetch'
import { useDepartmentMutation } from './use-department-mutation'
import { useFamilyMutation } from './use-family-mutation'
import { useIgnoredProductMutation } from './use-ignored-product-mutation'
import { useIgnoredSupplierMutation } from './use-ignored-supplier-mutation'
import { useImportMutation } from './use-import-mutation'
import { useInvoiceMutation } from './use-invoice-mutation'
import { useInvoiceOrderLinkMutation } from './use-invoice-order-link-mutation'
import { useOrderMutation } from './use-order-mutation'
import { usePackageBarcodeLinkMutation } from './use-package-barcode-link-mutation'
import { usePackingDefaultMutation } from './use-packing-default-mutation'
import { usePriceAdjustmentMutation } from './use-price-adjustment-mutation'
import { useProductMutation } from './use-product-mutation'
import { useQuoteMutation } from './use-quote-mutation'
import { useSellerMutation } from './use-seller-mutation'
import { useSettingsMutation } from './use-settings-mutation'
import { useSupplierMutation } from './use-supplier-mutation'

export const useAppHandler = () => {
  const {
    setProducts,
    setIgnoredProducts,
    setPackageBarcodeLinks,
    setSuppliers,
    setIgnoredSuppliers,
    setSellers,
    setFamilies,
    setDepartments,
    setQuotes,
    setOrdersByQuoteId,
    setOrdersByProductId,
    setInvoices,
    setPackingDefaults,
    setSettings,
    setPriceAdjustments
  } = useAppStore(
    useShallow((state) => ({
      setProducts: state.setProducts,
      setIgnoredProducts: state.setIgnoredProducts,
      setPackageBarcodeLinks: state.setPackageBarcodeLinks,
      setSuppliers: state.setSuppliers,
      setIgnoredSuppliers: state.setIgnoredSuppliers,
      setSellers: state.setSellers,
      setFamilies: state.setFamilies,
      setDepartments: state.setDepartments,
      setQuotes: state.setQuotes,
      setOrdersByQuoteId: state.setOrdersByQuoteId,
      setOrdersByProductId: state.setOrdersByProductId,
      setInvoices: state.setInvoices,
      setPackingDefaults: state.setPackingDefaults,
      setSettings: state.setSettings,
      setPriceAdjustments: state.setPriceAdjustments
    }))
  )

  const {
    fetchErrorCode,
    retryFetch,
    products,
    ignoredProducts,
    packageBarcodeLinks,
    suppliers,
    ignoredSuppliers,
    sellers,
    families,
    departments,
    quotes,
    ordersByQuoteId,
    ordersByProductId,
    invoices,
    packingDefaults,
    settings,
    priceAdjustments
  } = useDataFetch()
  const { createProduct, updateProduct, deleteProduct, updateProductsBatch } =
    useProductMutation()
  const { importData } = useImportMutation()
  const { createIgnoredProduct, deleteIgnoredProduct } =
    useIgnoredProductMutation()
  const { createPackageBarcodeLink } = usePackageBarcodeLinkMutation()
  const { createSupplier, updateSupplier, deleteSupplier } =
    useSupplierMutation()
  const { createIgnoredSupplier, deleteIgnoredSupplier } =
    useIgnoredSupplierMutation()
  const { createSeller, updateSeller, deleteSeller } = useSellerMutation()
  const { createFamily, updateFamily, deleteFamily } = useFamilyMutation()
  const { createDepartment, updateDepartment, deleteDepartment } =
    useDepartmentMutation()
  const { createQuote, updateQuote, deleteQuote } = useQuoteMutation()
  const { createOrder, createOrdersBatch, updateOrder, deleteOrder } =
    useOrderMutation()
  const { createInvoice, createInvoicesBatch, updateInvoice, deleteInvoice } =
    useInvoiceMutation()
  const { createOrderWithInvoiceLink, createOrdersBatchWithInvoiceLink } =
    useInvoiceOrderLinkMutation()
  const { upsertPackingDefault, savePackingCorrection, deletePackingDefault } =
    usePackingDefaultMutation()
  const { updateSettings } = useSettingsMutation()
  const { replacePriceAdjustments } = usePriceAdjustmentMutation()

  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isLoading = Boolean(isFetching || isMutating)

  useEffect(() => {
    useAppStore.setState({ fetchErrorCode, retryFetch })
  }, [fetchErrorCode, retryFetch])

  useEffect(() => {
    if (products) setProducts(products)
  }, [products, setProducts])

  useEffect(() => {
    if (ignoredProducts) setIgnoredProducts(ignoredProducts)
  }, [ignoredProducts, setIgnoredProducts])

  useEffect(() => {
    if (packageBarcodeLinks) setPackageBarcodeLinks(packageBarcodeLinks)
  }, [packageBarcodeLinks, setPackageBarcodeLinks])

  useEffect(() => {
    if (suppliers) setSuppliers(suppliers)
  }, [suppliers, setSuppliers])

  useEffect(() => {
    if (ignoredSuppliers) setIgnoredSuppliers(ignoredSuppliers)
  }, [ignoredSuppliers, setIgnoredSuppliers])

  useEffect(() => {
    if (sellers) setSellers(sellers)
  }, [sellers, setSellers])

  useEffect(() => {
    if (families) setFamilies(families)
  }, [families, setFamilies])

  useEffect(() => {
    if (departments) setDepartments(departments)
  }, [departments, setDepartments])

  useEffect(() => {
    if (quotes) setQuotes(quotes)
  }, [quotes, setQuotes])

  useEffect(() => {
    setOrdersByQuoteId(ordersByQuoteId ?? [])
  }, [ordersByQuoteId, setOrdersByQuoteId])

  useEffect(() => {
    setOrdersByProductId(ordersByProductId ?? [])
  }, [ordersByProductId, setOrdersByProductId])

  useEffect(() => {
    if (invoices) setInvoices(invoices)
  }, [invoices, setInvoices])

  useEffect(() => {
    if (packingDefaults) setPackingDefaults(packingDefaults)
  }, [packingDefaults, setPackingDefaults])

  useEffect(() => {
    if (settings !== undefined) setSettings(settings)
  }, [settings, setSettings])

  useEffect(() => {
    if (priceAdjustments) setPriceAdjustments(priceAdjustments)
  }, [priceAdjustments, setPriceAdjustments])

  useEffect(() => {
    useAppStore.setState({
      createProduct,
      updateProduct,
      updateProductsBatch,
      deleteProduct,
      createIgnoredProduct,
      deleteIgnoredProduct,
      createPackageBarcodeLink,
      createSupplier,
      updateSupplier,
      deleteSupplier,
      createIgnoredSupplier,
      deleteIgnoredSupplier,
      createSeller,
      updateSeller,
      deleteSeller,
      createFamily,
      updateFamily,
      deleteFamily,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      createQuote,
      updateQuote,
      deleteQuote,
      createOrder,
      createOrdersBatch,
      createOrderWithInvoiceLink,
      createOrdersBatchWithInvoiceLink,
      updateOrder,
      deleteOrder,
      upsertPackingDefault,
      savePackingCorrection,
      deletePackingDefault,
      importData,
      createInvoice,
      createInvoicesBatch,
      updateInvoice,
      deleteInvoice,
      updateSettings,
      replacePriceAdjustments
    })
  }, [
    createProduct,
    updateProduct,
    updateProductsBatch,
    deleteProduct,
    createIgnoredProduct,
    deleteIgnoredProduct,
    createPackageBarcodeLink,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createIgnoredSupplier,
    deleteIgnoredSupplier,
    createSeller,
    updateSeller,
    deleteSeller,
    createFamily,
    updateFamily,
    deleteFamily,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createQuote,
    updateQuote,
    deleteQuote,
    createOrder,
    createOrdersBatch,
    createOrderWithInvoiceLink,
    createOrdersBatchWithInvoiceLink,
    updateOrder,
    deleteOrder,
    upsertPackingDefault,
    savePackingCorrection,
    deletePackingDefault,
    importData,
    createInvoice,
    createInvoicesBatch,
    updateInvoice,
    deleteInvoice,
    updateSettings,
    replacePriceAdjustments
  ])

  return { isLoading }
}
