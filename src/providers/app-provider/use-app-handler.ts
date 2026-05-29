import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

import { useAppStore } from '@/stores'

import { useDataFetch } from './use-data-fetch'
import { useFamilyMutation } from './use-family-mutation'
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
    setQuotes,
    setOrdersByQuoteId
  } = useAppStore(
    useShallow((state) => ({
      setProducts: state.setProducts,
      setSuppliers: state.setSuppliers,
      setSellers: state.setSellers,
      setFamilies: state.setFamilies,
      setQuotes: state.setQuotes,
      setOrdersByQuoteId: state.setOrdersByQuoteId
    }))
  )

  const { products, suppliers, sellers, families, quotes, ordersByQuoteId } =
    useDataFetch()
  const { createProduct, updateProduct, deleteProduct } = useProductMutation()
  const { createSupplier, updateSupplier, deleteSupplier } =
    useSupplierMutation()
  const { createSeller, updateSeller, deleteSeller } = useSellerMutation()
  const { createFamily, updateFamily, deleteFamily } = useFamilyMutation()
  const { createQuote, updateQuote, deleteQuote } = useQuoteMutation()
  const { createOrder, updateOrder, deleteOrder } = useOrderMutation()

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
      createQuote,
      updateQuote,
      deleteQuote,
      createOrder,
      updateOrder,
      deleteOrder
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
    createQuote,
    updateQuote,
    deleteQuote,
    createOrder,
    updateOrder,
    deleteOrder
  ])

  return { isLoading }
}
