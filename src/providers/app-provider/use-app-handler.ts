import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAppStore } from '@/stores'

import { useDataFetch } from './use-data-fetch'
import { useProductMutation } from './use-product-mutation'

export const useAppHandler = () => {
  const setProducts = useAppStore((state) => state.setProducts)

  const { products } = useDataFetch()
  const { createProduct, updateProduct, deleteProduct } = useProductMutation()

  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isLoading = Boolean(isFetching || isMutating)

  useEffect(() => {
    if (products) setProducts(products)
  }, [products, setProducts])

  useEffect(() => {
    useAppStore.setState({ createProduct, updateProduct, deleteProduct })
  }, [createProduct, updateProduct, deleteProduct])

  return { isLoading }
}
