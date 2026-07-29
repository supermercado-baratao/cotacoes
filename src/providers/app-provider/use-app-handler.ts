import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

import { useAppStore } from '@/stores'

import { useDataFetch } from './use-data-fetch'
import { useFamilyMutation } from './use-family-mutation'
import { useImportMutation } from './use-import-mutation'
import { useInvoiceMutation } from './use-invoice-mutation'
import { useInvoiceOrderLinkMutation } from './use-invoice-order-link-mutation'
import { useOrderMutation } from './use-order-mutation'
import { usePriceAdjustmentMutation } from './use-price-adjustment-mutation'
import { useProductMutation } from './use-product-mutation'
import { useQuoteMutation } from './use-quote-mutation'
import { useSellerMutation } from './use-seller-mutation'
import { useSettingsMutation } from './use-settings-mutation'
import { useSupplierMutation } from './use-supplier-mutation'

export const useAppHandler = () => {
  const {
    setProducts,
    setSuppliers,
    setSellers,
    setFamilies,
    setQuotes,
    setOrdersByQuoteId,
    setOrdersByProductId,
    setInvoices,
    setSettings,
    setPriceAdjustments
  } = useAppStore(
    useShallow((state) => ({
      setProducts: state.setProducts,
      setSuppliers: state.setSuppliers,
      setSellers: state.setSellers,
      setFamilies: state.setFamilies,
      setQuotes: state.setQuotes,
      setOrdersByQuoteId: state.setOrdersByQuoteId,
      setOrdersByProductId: state.setOrdersByProductId,
      setInvoices: state.setInvoices,
      setSettings: state.setSettings,
      setPriceAdjustments: state.setPriceAdjustments
    }))
  )

  const {
    products,
    suppliers,
    sellers,
    families,
    quotes,
    ordersByQuoteId,
    ordersByProductId,
    invoices,
    settings,
    priceAdjustments
  } = useDataFetch()
  const { createProduct, updateProduct, deleteProduct, updateProductsBatch } =
    useProductMutation()
  const { importData } = useImportMutation()
  const { createSupplier, updateSupplier, deleteSupplier } =
    useSupplierMutation()
  const { createSeller, updateSeller, deleteSeller } = useSellerMutation()
  const { createFamily, updateFamily, deleteFamily } = useFamilyMutation()
  const { createQuote, updateQuote, deleteQuote } = useQuoteMutation()
  const { createOrder, createOrdersBatch, updateOrder, deleteOrder } =
    useOrderMutation()
  const { createInvoice, createInvoicesBatch, updateInvoice, deleteInvoice } =
    useInvoiceMutation()
  const { createOrderWithInvoiceLink, createOrdersBatchWithInvoiceLink } =
    useInvoiceOrderLinkMutation()
  const { updateSettings } = useSettingsMutation()
  const { replacePriceAdjustments } = usePriceAdjustmentMutation()

  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isLoading = Boolean(isFetching || isMutating)

  useEffect(() => {
    if (products) setProducts(products)
  }, [products, setProducts])

  useEffect(() => {
    if (suppliers) setSuppliers(suppliers)
  }, [suppliers, setSuppliers])

  useEffect(() => {
    if (sellers) setSellers(sellers)
  }, [sellers, setSellers])

  useEffect(() => {
    if (families) setFamilies(families)
  }, [families, setFamilies])

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
      createSupplier,
      updateSupplier,
      deleteSupplier,
      createSeller,
      updateSeller,
      deleteSeller,
      createFamily,
      updateFamily,
      deleteFamily,
      createQuote,
      updateQuote,
      deleteQuote,
      createOrder,
      createOrdersBatch,
      createOrderWithInvoiceLink,
      createOrdersBatchWithInvoiceLink,
      updateOrder,
      deleteOrder,
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
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createSeller,
    updateSeller,
    deleteSeller,
    createFamily,
    updateFamily,
    deleteFamily,
    createQuote,
    updateQuote,
    deleteQuote,
    createOrder,
    createOrdersBatch,
    createOrderWithInvoiceLink,
    createOrdersBatchWithInvoiceLink,
    updateOrder,
    deleteOrder,
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
