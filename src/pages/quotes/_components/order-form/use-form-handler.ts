import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TOrder } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { useProductHistory } from '../use-product-history'
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

  const { history } = useProductHistory()
  const lastOrder = history[0] ?? null

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

  const watchedSupplierId = useWatch({ control, name: 'supplierId' })
  const watchedSellerId = useWatch({ control, name: 'sellerId' })

  const filteredSellers = useMemo(() => {
    if (!watchedSupplierId) return sellers ?? []
    const supplier = suppliers?.find((s) => s.id === watchedSupplierId)
    if (!supplier) return sellers ?? []
    return (sellers ?? []).filter((s) => supplier.sellerIds.includes(s.id))
  }, [watchedSupplierId, suppliers, sellers])

  const filteredSuppliers = useMemo(() => {
    if (!watchedSellerId) return suppliers ?? []
    const seller = sellers?.find((s) => s.id === watchedSellerId)
    if (!seller) return suppliers ?? []
    return (suppliers ?? []).filter((s) => seller.supplierIds.includes(s.id))
  }, [watchedSellerId, suppliers, sellers])

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
    suppliers: filteredSuppliers,
    sellers: filteredSellers,
    product,
    lastOrder
  }
}
