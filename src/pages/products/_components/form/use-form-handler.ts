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
  const { createProduct, updateProduct } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      description: product?.description ?? '',
      price: product?.price ?? 0,
      purchasePrice: product?.purchasePrice ?? 0,
      quantity: product?.quantity ?? 0,
      packaging: product?.packaging ?? '',
      barcode: product?.barcode ?? '',
      supplier: product?.supplier ?? '',
      tax: product?.tax ?? 0,
      margin: product?.margin ?? 0,
      observation: product?.observation ?? '',
      expirationDate: product?.expirationDate ?? '',
      family: product?.family ?? ''
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
    setSuccessCallbacks([handleClose, () => setFormProduct(null)])
    if (product) {
      updateProduct({ ...product, ...data })
      return
    }
    createProduct(data)
  })

  return { register, onSubmit, errors, control, suggestedPrice }
}
