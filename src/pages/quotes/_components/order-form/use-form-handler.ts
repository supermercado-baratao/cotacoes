import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TOrder } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { createSchema, type TSchema } from './schema'

export const useFormHandler = (
  productId: string | null,
  order: TOrder | null,
  setFormOrder: (order: TOrder | null) => void,
  handleClose: () => void
) => {
  const {
    createOrder,
    updateOrder,
    suppliers,
    sellers,
    products,
    quotes,
    quoteId
  } = useAppStore()

  const product = products?.find((p) => p.id === productId) ?? null
  const { setSuccessCallbacks } = useCallbackStore()

  const quoteDate = useMemo(
    () => quotes?.find((q) => q.id === quoteId)?.date ?? '',
    [quotes, quoteId]
  )

  const defaultValues: Partial<TSchema> = useMemo(
    () => ({
      supplierId: order?.supplierId ?? '',
      sellerId: order?.sellerId ?? null,
      date: order?.date ?? dayjs().format('YYYY-MM-DD'),
      price: order?.price ?? undefined,
      quantity: order?.quantity ?? undefined,
      packing: order?.packing ?? '',
      observations: order?.observations ?? null
    }),
    [order]
  )

  const schema = useMemo(() => createSchema(quoteDate), [quoteDate])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit((data) => {
    if (order) {
      setSuccessCallbacks([handleClose, () => setFormOrder(null)])
      updateOrder({ ...order, ...data })
      return
    }

    if (!quoteId || !productId) return

    setSuccessCallbacks([handleClose])
    createOrder({
      ...data,
      quoteId,
      productId
    })
  })

  return {
    register,
    onSubmit,
    errors,
    control,
    suppliers: suppliers ?? [],
    sellers: sellers ?? [],
    product
  }
}
