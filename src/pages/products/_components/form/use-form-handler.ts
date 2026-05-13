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
  const { createProduct, updateProduct, suppliers, families } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      description: product?.description ?? '',
      price: product?.price ?? 0,
      purchasePrice: product?.purchasePrice ?? 0,
      quantity: product?.quantity ?? 0,
      packaging: product?.packaging ?? null,
      supplierIds: product?.supplierIds ?? [],
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

  const [purchasePrice, tax, margin] = useWatch({
    control,
    name: ['purchasePrice', 'tax', 'margin']
  })

  const suggestedPrice = calcSuggestedPrice({ purchasePrice, tax, margin })

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
    suppliers: suppliers ?? [],
    families: families ?? []
  }
}
