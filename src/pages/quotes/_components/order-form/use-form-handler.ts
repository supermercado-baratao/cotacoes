import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TOrder, TQuoteItem } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { useProductHistory } from '../use-product-history'
import { createSchema, type TSchema } from './schema'

export const useFormHandler = (
  quoteItem: TQuoteItem | null,
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
    quoteId,
    setHistoryProductId
  } = useAppStore()

  const { setSuccessCallbacks } = useCallbackStore()
  const { history } = useProductHistory()
  const lastOrder = history[0] ?? null

  const quoteDate = useMemo(
    () => quotes?.find((q) => q.id === quoteId)?.date ?? '',
    [quotes, quoteId]
  )

  const selectableProducts = useMemo(() => {
    if (!quoteItem) return []
    if (quoteItem.type === 'product')
      return (products ?? []).filter((p) => p.id === quoteItem.id)
    if (quoteItem.type === 'family')
      return (products ?? []).filter((p) => p.familyId === quoteItem.id)
    return (products ?? []).filter((p) => p.groupId === quoteItem.id)
  }, [quoteItem, products])

  const defaultValues: Partial<TSchema> = useMemo(
    () => ({
      productId:
        order?.productId ??
        (quoteItem?.type === 'product' ? (quoteItem.id ?? '') : ''),
      supplierId: order?.supplierId ?? '',
      sellerId: order?.sellerId ?? null,
      date: order?.date ?? dayjs().format('YYYY-MM-DD'),
      price: order?.price ?? undefined,
      quantity: order?.quantity ?? undefined,
      packing: order?.packing ?? '',
      observations: order?.observations ?? null
    }),
    [order, quoteItem]
  )

  const schema = useMemo(() => createSchema(quoteDate), [quoteDate])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<TSchema>({ resolver: zodResolver(schema), defaultValues })

  const watchedProductId = useWatch({ control, name: 'productId' })
  const watchedSupplierId = useWatch({ control, name: 'supplierId' })
  const watchedSellerId = useWatch({ control, name: 'sellerId' })

  useEffect(() => {
    setHistoryProductId(watchedProductId || null)
  }, [watchedProductId, setHistoryProductId])

  useEffect(() => {
    return () => setHistoryProductId(null)
  }, [setHistoryProductId])

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
    if (!quoteId || !quoteItem) return

    if (order) {
      setSuccessCallbacks([handleClose, () => setFormOrder(null)])
      updateOrder({ ...order, ...data })
      return
    }

    setSuccessCallbacks([handleClose])
    createOrder({
      ...data,
      quoteId,
      quoteItemId: quoteItem.id,
      quoteItemType: quoteItem.type
    })
  })

  const product = useMemo(
    () =>
      quoteItem?.type === 'product'
        ? (products?.find((p) => p.id === quoteItem.id) ?? null)
        : null,
    [quoteItem, products]
  )

  return {
    register,
    onSubmit,
    errors,
    control,
    suppliers: filteredSuppliers,
    sellers: filteredSellers,
    selectableProducts,
    showProductSelect: quoteItem?.type !== 'product',
    product,
    lastOrder
  }
}
