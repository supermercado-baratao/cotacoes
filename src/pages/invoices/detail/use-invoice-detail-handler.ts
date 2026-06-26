import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import type { TInvoiceItem, TInvoiceItemMatchStatus } from '@/models'
import { useAppStore } from '@/stores'

export type TInvoiceItemRow = TInvoiceItem & {
  orderQuantity: number | null
  orderPrice: number | null
  productDescription: string | null
}

export const useInvoiceDetailHandler = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    invoices,
    products,
    quotes,
    ordersByQuoteId,
    setQuoteId,
    updateInvoice
  } = useAppStore()

  const invoice = useMemo(
    () => invoices?.find((inv) => inv.id === id) ?? null,
    [invoices, id]
  )

  const isFetching = invoices === null

  useEffect(() => {
    if (invoices !== null && !invoice) navigate('/invoices')
  }, [invoices, invoice, navigate])

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    invoice?.quoteId ?? null
  )

  const [productIdOverrides, setProductIdOverrides] = useState<
    Map<number, string | null>
  >(new Map())

  const [confirmedManual, setConfirmedManual] = useState<Set<number>>(new Set())

  const handleQuoteChange = (quoteId: string | null) => {
    setSelectedQuoteId(quoteId)
    setQuoteId(quoteId)
  }

  const productMap = useMemo(
    () => new Map(products?.map((p) => [p.id, p]) ?? []),
    [products]
  )

  const ordersForSupplier = useMemo(
    () =>
      (ordersByQuoteId ?? []).filter(
        (o) => o.supplierId === invoice?.supplierId
      ),
    [ordersByQuoteId, invoice?.supplierId]
  )

  const itemsWithDivergences = useMemo((): TInvoiceItemRow[] => {
    if (!invoice) return []
    return invoice.items.map((item) => {
      const effectiveProductId = productIdOverrides.has(item.itemNumber)
        ? (productIdOverrides.get(item.itemNumber) ?? null)
        : item.productId

      const order = effectiveProductId
        ? (ordersForSupplier.find((o) => o.productId === effectiveProductId) ??
          null)
        : null

      const isManual =
        item.matchStatus === 'manual' &&
        !confirmedManual.has(item.itemNumber) &&
        !productIdOverrides.has(item.itemNumber)

      const matchStatus: TInvoiceItemMatchStatus = !effectiveProductId
        ? 'unmatched_product'
        : isManual
          ? 'manual'
          : !order
            ? 'unmatched_order'
            : 'matched'

      return {
        ...item,
        productId: effectiveProductId,
        matchStatus,
        orderId: order?.id ?? null,
        priceDivergence: order ? item.unitPrice - order.price : null,
        quantityDivergence: order ? item.quantity - order.quantity : null,
        orderQuantity: order?.quantity ?? null,
        orderPrice: order?.price ?? null,
        productDescription:
          productMap.get(effectiveProductId ?? '')?.description ?? null
      }
    })
  }, [
    invoice,
    ordersForSupplier,
    productMap,
    productIdOverrides,
    confirmedManual
  ])

  const missingOrders = useMemo(
    () =>
      ordersForSupplier.filter(
        (o) =>
          !itemsWithDivergences.some((item) => item.productId === o.productId)
      ),
    [ordersForSupplier, itemsWithDivergences]
  )

  const handleConfirmMatch = (itemNumber: number) => {
    setConfirmedManual((prev) => new Set([...prev, itemNumber]))
  }

  const handleRejectMatch = (itemNumber: number) => {
    setProductIdOverrides((prev) => {
      const next = new Map(prev)
      next.set(itemNumber, null)
      return next
    })
    setConfirmedManual((prev) => {
      const next = new Set(prev)
      next.delete(itemNumber)
      return next
    })
  }

  const handleAssignProduct = (itemNumber: number, productId: string) => {
    setProductIdOverrides((prev) => {
      const next = new Map(prev)
      next.set(itemNumber, productId)
      return next
    })
  }

  const buildUpdatedItems = (): TInvoiceItem[] =>
    itemsWithDivergences.map(
      (item): TInvoiceItem => ({
        itemNumber: item.itemNumber,
        supplierProductCode: item.supplierProductCode,
        barcode: item.barcode,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        productId: item.productId,
        orderId: item.orderId,
        matchStatus: item.matchStatus,
        priceDivergence: item.priceDivergence,
        quantityDivergence: item.quantityDivergence
      })
    )

  const handleSaveAdjustments = () => {
    if (!invoice) return
    updateInvoice({
      ...invoice,
      quoteId: selectedQuoteId,
      items: buildUpdatedItems()
    })
  }

  const handleApprove = () => {
    if (!invoice) return
    updateInvoice({
      ...invoice,
      verificationStatus: 'approved',
      quoteId: selectedQuoteId,
      items: buildUpdatedItems()
    })
  }

  const handleMarkDivergent = () => {
    if (!invoice) return
    updateInvoice({
      ...invoice,
      verificationStatus: 'divergent',
      quoteId: selectedQuoteId,
      items: buildUpdatedItems()
    })
  }

  const handleBack = () => navigate('/invoices')

  return {
    invoice,
    isFetching,
    quotes,
    products: products ?? [],
    selectedQuoteId,
    handleQuoteChange,
    itemsWithDivergences,
    missingOrders,
    productMap,
    handleSaveAdjustments,
    handleApprove,
    handleMarkDivergent,
    handleBack,
    handleConfirmMatch,
    handleRejectMatch,
    handleAssignProduct
  }
}
