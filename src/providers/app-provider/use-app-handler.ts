import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

import { useAppStore } from '@/stores'

import { useDataFetch } from './use-data-fetch'
import { useFamilyMutation } from './use-family-mutation'
import { useGroupMutation } from './use-group-mutation'
import { useImportMutation } from './use-import-mutation'
import { useInvoiceMutation } from './use-invoice-mutation'
import { useOrderMutation } from './use-order-mutation'
import { useProductMutation } from './use-product-mutation'
import { useQuoteMutation } from './use-quote-mutation'
import { useSellerMutation } from './use-seller-mutation'
import { useSupplierMutation } from './use-supplier-mutation'

export const useAppHandler = () => {
  const {
    setProducts,
    setSuppliers,
    setSellers,
    setFamilies,
    setGroups,
    setQuotes,
    setOrdersByQuoteId,
    setOrdersByProductId,
    setInvoices
  } = useAppStore(
    useShallow((state) => ({
      setProducts: state.setProducts,
      setSuppliers: state.setSuppliers,
      setSellers: state.setSellers,
      setFamilies: state.setFamilies,
      setGroups: state.setGroups,
      setQuotes: state.setQuotes,
      setOrdersByQuoteId: state.setOrdersByQuoteId,
      setOrdersByProductId: state.setOrdersByProductId,
      setInvoices: state.setInvoices
    }))
  )

  const {
    products,
    suppliers,
    sellers,
    families,
    groups,
    quotes,
    ordersByQuoteId,
    ordersByProductId,
    invoices
  } = useDataFetch()
  const { createProduct, updateProduct, deleteProduct } = useProductMutation()
  const { importData } = useImportMutation()
  const { createSupplier, updateSupplier, deleteSupplier } =
    useSupplierMutation()
  const { createSeller, updateSeller, deleteSeller } = useSellerMutation()
  const { createFamily, updateFamily, deleteFamily } = useFamilyMutation()
  const { createGroup, updateGroup, deleteGroup } = useGroupMutation()
  const { createQuote, updateQuote, deleteQuote } = useQuoteMutation()
  const { createOrder, updateOrder, deleteOrder } = useOrderMutation()
  const { createInvoice, updateInvoice, deleteInvoice } = useInvoiceMutation()

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
    if (groups) setGroups(groups)
  }, [groups, setGroups])

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
    useAppStore.setState({
      createProduct,
      updateProduct,
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
      createGroup,
      updateGroup,
      deleteGroup,
      createQuote,
      updateQuote,
      deleteQuote,
      createOrder,
      updateOrder,
      deleteOrder,
      importData,
      createInvoice,
      updateInvoice,
      deleteInvoice
    })
  }, [
    createProduct,
    updateProduct,
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
    createGroup,
    updateGroup,
    deleteGroup,
    createQuote,
    updateQuote,
    deleteQuote,
    createOrder,
    updateOrder,
    deleteOrder,
    importData,
    createInvoice,
    updateInvoice,
    deleteInvoice
  ])

  return { isLoading }
}
