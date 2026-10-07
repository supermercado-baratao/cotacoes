import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo
} from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TInvoice } from '@/models/invoice-model/types'
import type { TOrder } from '@/models/order-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TQuoteItem } from '@/models/quote-model/types'
import type { TSeller } from '@/models/seller-model/types'
import type { TSupplier } from '@/models/supplier-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { findPackingDefault } from '@/utils/packing-defaults'
import { findSupplierByCnpj } from '@/utils/suppliers'

import { createSchema, type TSchema } from './schema'
import { useProductHistory } from './use-product-history'
import { extractPackingInfo, getUnitPriceFromPackingPrice } from './utils'

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
    packingDefaults,
    upsertPackingDefault,
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
        (item) => item.itemNumber === invoiceRef.itemNumber
      )
    : null

  const defaultValues: Partial<TSchema> = useMemo(() => {
    const extractedPacking =
      !order && invoiceItem ? extractPackingInfo(invoiceItem.unit) : null

    return {
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
      price:
        order?.price ??
        (invoiceItem
          ? getUnitPriceFromPackingPrice(
              invoiceItem.unitPrice,
              extractedPacking?.packingQuantity ?? 1
            )
          : undefined),
      quantity: order?.quantity ?? invoiceItem?.quantity ?? undefined,
      packing:
        order?.packing ?? extractedPacking?.packing ?? invoiceItem?.unit ?? '',
      packingQuantity:
        order?.packingQuantity ?? extractedPacking?.packingQuantity ?? 1,
      observations: order?.observations ?? null
    }
  }, [order, invoiceRef, invoiceItem, suppliers])

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
    formState: { errors, dirtyFields }
  } = useForm<TSchema>({ resolver: zodResolver(schema), defaultValues })

  const watchedProductId = useWatch({ control, name: 'productId' })
  const watchedSupplierId = useWatch({ control, name: 'supplierId' })
  const watchedSellerId = useWatch({ control, name: 'sellerId' })
  const watchedPrice = useWatch({ control, name: 'price' })
  const watchedPacking = useWatch({ control, name: 'packing' })

  const linkedInvoiceItem = useMemo(() => {
    if (invoiceItem) return invoiceItem
    if (!order?.invoiceId) return null
    const invoice = invoices?.find((invoice) => invoice.id === order.invoiceId)
    return invoice?.items.find((item) => item.orderId === order.id) ?? null
  }, [invoiceItem, order, invoices])

  const invoiceUnitPrice = linkedInvoiceItem?.unitPrice ?? null

  const applyPackingQuantityPrice = useCallback(
    (packingQuantity: number, shouldDirty: boolean) => {
      if (invoiceUnitPrice == null) return
      setValue(
        'price',
        getUnitPriceFromPackingPrice(invoiceUnitPrice, packingQuantity),
        { shouldValidate: true, shouldDirty }
      )
    },
    [invoiceUnitPrice, setValue]
  )

  const handlePackingQuantityChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const raw = event.target.value
    const packingQuantity =
      raw === '' ? 1 : Math.max(1, Math.trunc(Number(raw)) || 1)
    applyPackingQuantityPrice(packingQuantity, true)
  }

  useEffect(() => {
    if (
      order ||
      !watchedProductId ||
      !watchedSupplierId ||
      !watchedPacking ||
      dirtyFields.packingQuantity
    )
      return
    const found = findPackingDefault(packingDefaults ?? [], {
      supplierId: watchedSupplierId,
      productId: watchedProductId,
      packing: watchedPacking
    })
    if (!found) return
    setValue('packingQuantity', found.packingQuantity, { shouldDirty: false })
    applyPackingQuantityPrice(found.packingQuantity, false)
  }, [
    order,
    dirtyFields.packingQuantity,
    watchedProductId,
    watchedSupplierId,
    watchedPacking,
    packingDefaults,
    setValue,
    applyPackingQuantityPrice
  ])

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

    upsertPackingDefault({
      supplierId: data.supplierId,
      productId: data.productId,
      packing: data.packing,
      packingQuantity: data.packingQuantity
    })

    if (order) {
      updateOrder({ ...order, ...data, quoteItemId: quoteItem.id })
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

  const margin = useMemo(() => {
    const salePrice = selectedProduct?.price
    if (!salePrice || !watchedPrice) return null
    return ((salePrice - watchedPrice) / salePrice) * 100
  }, [selectedProduct, watchedPrice])

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
    margin,
    lastOrder,
    invoiceItem,
    handleProductCreated,
    handleSupplierCreated,
    handleSellerCreated,
    handlePackingQuantityChange
  }
}
