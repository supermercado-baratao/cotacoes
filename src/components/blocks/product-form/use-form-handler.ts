import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TProduct } from '@/models/product/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import {
  evaluateMargin,
  getMarginTolerance,
  type TMarginStatus
} from '@/utils/margin'

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
  const { createProduct, updateProduct, families, departments, settings } =
    useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(() => {
    const barcodes =
      product?.barcodes ?? (draft?.barcode ? [draft.barcode] : [])
    return {
      id: product?.id ?? '',
      description: product?.description ?? draft?.description ?? '',
      price: product?.price ?? draft?.price ?? 0,
      costWithTax: product?.costWithTax ?? null,
      tax: product?.tax ?? null,
      margin: product?.margin ?? null,
      stock: product?.stock ?? 0,
      packagings:
        barcodes.length > 0
          ? barcodes.map((barcode, index) => ({
              barcode,
              packType: product?.packTypes[index] ?? ''
            }))
          : [{ barcode: '', packType: '' }],
      department: product?.department ?? '',
      section: product?.section ?? '',
      group: product?.group ?? '',
      observations: product?.observations ?? null,
      familyId: product?.familyId ?? null,
      departmentId: product?.departmentId ?? null
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

  const [price, costWithTax, departmentId] = useWatch({
    control,
    name: ['price', 'costWithTax', 'departmentId']
  })

  const marginStatus: TMarginStatus | null = useMemo(() => {
    if (!price || costWithTax == null) return null

    const actualMargin = ((price - costWithTax) / price) * 100
    const tolerance = getMarginTolerance(settings, departmentId)
    return evaluateMargin(actualMargin, tolerance).status
  }, [price, costWithTax, departmentId, settings])

  const onSubmit = handleSubmit(
    ({ packagings, costWithTax = null, ...rest }) => {
      const barcodes = packagings.map((p) => p.barcode)
      const packTypes = packagings.map((p) => p.packType)

      product
        ? updateProduct({
            ...rest,
            id: product.id,
            barcodes,
            packTypes,
            costWithTax,
            vrCreatedAt: product.vrCreatedAt,
            createdAt: product.createdAt
          })
        : createProduct(
            {
              ...rest,
              barcodes,
              packTypes,
              vrCreatedAt: '',
              costWithTax
            },
            onCreated ? { onSuccess: onCreated } : undefined
          )

      setSuccessCallbacks([handleClose, () => setFormProduct(null)])
    }
  )

  return {
    register,
    onSubmit,
    errors,
    control,
    families: families ?? [],
    departments: departments ?? [],
    marginStatus
  }
}
