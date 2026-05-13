import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TProduct } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { calcSuggestedPrice } from '../../utils'
import { schema, type TSchema } from './schema'

export const useFormHandler = (
  product: TProduct | null,
  setFormProduct: (product: TProduct | null) => void,
  handleClose: () => void
) => {
  const { createProduct, updateProduct, suppliers, sellers, families } =
    useAppStore()

  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      description: product?.description ?? '',
      price: product?.price ?? 0,
      purchasePrice: product?.purchasePrice ?? 0,
      quantity: product?.quantity ?? 0,
      packaging: product?.packaging ?? null,
      supplierIds: product?.supplierIds ?? [],
      sellerIds: product?.sellerIds ?? [],
      barcode: product?.barcode ?? null,
      tax: product?.tax ?? 0,
      margin: product?.margin ?? 0,
      observation: product?.observation ?? null,
      expirationDate: product?.expirationDate ?? null,
      familyId: product?.familyId ?? null
    }),
    [product]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const [purchasePrice, tax, margin, supplierIds, sellerIds] = useWatch({
    control,
    name: ['purchasePrice', 'tax', 'margin', 'supplierIds', 'sellerIds']
  })

  const suggestedPrice = calcSuggestedPrice({ purchasePrice, tax, margin })

  const filteredSuppliers = useMemo(() => {
    const allSuppliers = suppliers ?? []
    if (!sellerIds?.length) return allSuppliers
    return allSuppliers.filter((s) =>
      s.sellerIds.some((id) => sellerIds.includes(id))
    )
  }, [suppliers, sellerIds])

  const filteredSellers = useMemo(() => {
    const allSellers = sellers ?? []
    if (!supplierIds?.length) return allSellers
    return allSellers.filter((s) =>
      s.supplierIds.some((id) => supplierIds.includes(id))
    )
  }, [sellers, supplierIds])

  const onSubmit = handleSubmit((data) => {
    if (product) {
      setSuccessCallbacks([handleClose, () => setFormProduct(null)])
      updateProduct({ ...product, ...data })
      return
    }
    setSuccessCallbacks([handleClose, () => reset(defaultValues)])
    createProduct(data)
  })

  return {
    register,
    onSubmit,
    errors,
    control,
    suggestedPrice,
    suppliers: filteredSuppliers,
    sellers: filteredSellers,
    families: families ?? []
  }
}
