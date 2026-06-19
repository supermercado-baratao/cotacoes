import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TProduct } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  product: TProduct | null,
  setFormProduct: (product: TProduct | null) => void,
  handleClose: () => void
) => {
  const { createProduct, updateProduct, families, suppliers } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      id: product?.id ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      barcode: product?.barcode ?? null,
      tax: product?.tax ?? null,
      margin: product?.margin ?? null,
      observations: product?.observations ?? null,
      familyId: product?.familyId ?? null,
      supplierIds: product?.supplierIds ?? []
    }),
    [product]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit((data) => {
    if (product) {
      setSuccessCallbacks([handleClose, () => setFormProduct(null)])
      updateProduct({ ...product, ...data, id: product.id })
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
    families: families ?? [],
    suppliers: suppliers ?? []
  }
}
