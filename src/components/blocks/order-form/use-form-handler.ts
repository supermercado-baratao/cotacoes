import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { type ChangeEvent, useEffect, useLayoutEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type {
  TInvoice,
  TOrder,
  TProduct,
  TQuoteItem,
  TSeller,
  TSupplier
} from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import { findSupplierByCnpj } from '@/utils'

import { createSchema, type TSchema } from './schema'
import { useProductHistory } from './use-product-history'
import { getUnitPriceFromPackingPrice } from './utils'

type TInvoiceRef = { invoice: TInvoice; itemNumber: number }

export const useFormHandler = (
  quoteItem: TQuoteItem | null,
  order: TOrder | null,
  setFormOrder: (order: TOrder | null) => void,
  handleClose: () => void,
  invoiceRef?: TInvoiceRef | null
) => {
  const {
    createOrder,
    createOrderWithInvoiceLink,
    updateOrder,
    suppliers,
    sellers,
    products,
    quotes,
    quoteId,
    invoices,
    setHistoryProductId
  } = useAppStore()

  const { setSuccessCallbacks } = useCallbackStore()
  const { history } = useProductHistory()
  const lastOrder = history[0] ?? null

  const quoteDate = useMemo(
    () => quotes?.find((q) => q.id === quoteId)?.date ?? '',
    [quotes, quoteId]
  )

  const invoiceItem = invoiceRef
    ? invoiceRef.invoice.items.find(
        (i) => i.itemNumber === invoiceRef.itemNumber
      )
    : null

  const defaultValues: Partial<TSchema> = useMemo(
    () => ({
      productId: order?.productId ?? invoiceItem?.productId ?? '',
      supplierId: (() => {
        if (order?.supplierId) return order.supplierId
        if (!invoiceRef) return ''
        return (
          findSupplierByCnpj(invoiceRef.invoice.supplierCnpj, suppliers ?? [])
            ?.id ?? ''
        )
      })(),
      sellerId: order?.sellerId ?? null,
      date:
        order?.date ??
        (invoiceRef
          ? dayjs(invoiceRef.invoice.emissionDate).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD')),
      price: order?.price ?? invoiceItem?.unitPrice ?? undefined,
      quantity: order?.quantity ?? invoiceItem?.quantity ?? undefined,
      packing: order?.packing ?? invoiceItem?.unit ?? '',
      packingQuantity: order?.packingQuantity ?? 1,
      observations: order?.observations ?? null
    }),
    [order, invoiceRef, invoiceItem, suppliers]
  )

  const schema = useMemo(
    () => createSchema(invoiceRef ? '' : quoteDate),
    [quoteDate, invoiceRef]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors }
  } = useForm<TSchema>({ resolver: zodResolver(schema), defaultValues })

  const watchedProductId = useWatch({ control, name: 'productId' })
  const watchedSupplierId = useWatch({ control, name: 'supplierId' })
  const watchedSellerId = useWatch({ control, name: 'sellerId' })

  const linkedInvoiceItem = useMemo(() => {
    if (invoiceItem) return invoiceItem
    if (!order?.invoiceId) return null
    const invoice = invoices?.find((i) => i.id === order.invoiceId)
    return invoice?.items.find((i) => i.orderId === order.id) ?? null
  }, [invoiceItem, order, invoices])

  const invoiceUnitPrice = linkedInvoiceItem?.unitPrice ?? null

  const handlePackingQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (invoiceUnitPrice == null) return
    const raw = e.target.value
    const packingQuantity = raw === '' ? 1 : Math.max(1, parseInt(raw, 10) || 1)
    setValue(
      'price',
      getUnitPriceFromPackingPrice(invoiceUnitPrice, packingQuantity),
      { shouldValidate: true, shouldDirty: true }
    )
  }

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
    return (sellers ?? []).filter((s) => s.supplierIds.includes(supplier.id))
  }, [watchedSupplierId, suppliers, sellers])

  const filteredSuppliers = useMemo(() => {
    if (!watchedSellerId) return suppliers ?? []
    const seller = sellers?.find((s) => s.id === watchedSellerId)
    if (!seller) return suppliers ?? []
    return (suppliers ?? []).filter((s) => seller.supplierIds.includes(s.id))
  }, [watchedSellerId, suppliers, sellers])

  useLayoutEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit((data) => {
    if (!quoteId || !quoteItem) return

    if (order) {
      updateOrder({ ...order, ...data })
    } else if (invoiceRef) {
      createOrderWithInvoiceLink({
        order: {
          ...data,
          quoteId,
          quoteItemId: quoteItem.id,
          invoiceId: invoiceRef.invoice.id
        },
        invoice: invoiceRef.invoice,
        itemNumber: invoiceRef.itemNumber
      })
    } else {
      createOrder({
        ...data,
        quoteId,
        quoteItemId: quoteItem.id,
        invoiceId: null
      })
    }

    setSuccessCallbacks([handleClose, () => setFormOrder(null)])
  })

  const selectedProduct = useMemo(
    () => products?.find((p) => p.id === watchedProductId) ?? null,
    [watchedProductId, products]
  )

  const handleProductCreated = (product: TProduct) => {
    setValue('productId', product.id, {
      shouldValidate: true,
      shouldDirty: true
    })
  }

  const handleSupplierCreated = (supplier: TSupplier) => {
    setValue('supplierId', supplier.id, {
      shouldValidate: true,
      shouldDirty: true
    })
  }

  const handleSellerCreated = (seller: TSeller) => {
    setValue('sellerId', seller.id, {
      shouldValidate: true,
      shouldDirty: true
    })
  }

  return {
    register,
    onSubmit,
    errors,
    control,
    suppliers: filteredSuppliers,
    sellers: filteredSellers,
    selectableProducts: products ?? [],
    selectedProduct,
    lastOrder,
    invoiceItem,
    handleProductCreated,
    handleSupplierCreated,
    handleSellerCreated,
    handlePackingQuantityChange
  }
}
