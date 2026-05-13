import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAppStore } from '@/stores'

import { useDataFetch } from './use-data-fetch'
import { useFamilyMutation } from './use-family-mutation'
import { useProductMutation } from './use-product-mutation'
import { useSellerMutation } from './use-seller-mutation'
import { useSupplierMutation } from './use-supplier-mutation'

export const useAppHandler = () => {
  const setProducts = useAppStore((state) => state.setProducts)
  const setSuppliers = useAppStore((state) => state.setSuppliers)
  const setSellers = useAppStore((state) => state.setSellers)
  const setFamilies = useAppStore((state) => state.setFamilies)

  const { products, suppliers, sellers, families } = useDataFetch()
  const { createProduct, updateProduct, deleteProduct } = useProductMutation()
  const { createSupplier, updateSupplier, deleteSupplier } =
    useSupplierMutation()
  const { createSeller, updateSeller, deleteSeller } = useSellerMutation()
  const { createFamily, updateFamily, deleteFamily } = useFamilyMutation()

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
      deleteFamily
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
    deleteFamily
  ])

  return { isLoading }
}
