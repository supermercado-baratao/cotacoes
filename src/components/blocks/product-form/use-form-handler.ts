import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TProduct } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export type TProductDraft = {
  description: string
  barcode: string
  price: number
}

export const useFormHandler = (
  product: TProduct | null,
  draft: TProductDraft | null,
  setFormProduct: (product: TProduct | null) => void,
  handleClose: () => void,
  onCreated?: (product: TProduct) => void
) => {
  const { createProduct, updateProduct, families } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(() => {
    const barcodes =
      product?.barcodes ?? (draft?.barcode ? [draft.barcode] : [])
    return {
      id: product?.id ?? '',
      description: product?.description ?? draft?.description ?? '',
      price: product?.price ?? draft?.price ?? 0,
      tax: product?.tax ?? null,
      margin: product?.margin ?? null,
      stock: product?.stock ?? 0,
      packagings: barcodes.length
        ? barcodes.map((barcode, i) => ({
            barcode,
            packType: product?.packTypes[i] ?? ''
          }))
        : [{ barcode: '', packType: '' }],
      department: product?.department ?? '',
      section: product?.section ?? '',
      group: product?.group ?? '',
      observations: product?.observations ?? null,
      familyId: product?.familyId ?? null
    }
  }, [product, draft])

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

  const onSubmit = handleSubmit(({ packagings, ...rest }) => {
    const barcodes = packagings.map((p) => p.barcode)
    const packTypes = packagings.map((p) => p.packType)

    product
      ? updateProduct({
          ...product,
          ...rest,
          id: product.id,
          barcodes,
          packTypes
        })
      : createProduct(
          { ...rest, barcodes, packTypes, vrCreatedAt: '' },
          onCreated ? { onSuccess: onCreated } : undefined
        )

    setSuccessCallbacks([handleClose, () => setFormProduct(null)])
  })

  return {
    register,
    onSubmit,
    errors,
    control,
    families: families ?? []
  }
}
