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
      const order = item.productId
        ? (ordersForSupplier.find((o) => o.productId === item.productId) ??
          null)
        : null

      const matchStatus: TInvoiceItemMatchStatus = !item.productId
        ? 'unmatched_product'
        : !order
          ? 'unmatched_order'
          : 'matched'

      return {
        ...item,
        matchStatus,
        orderId: order?.id ?? null,
        priceDivergence: order ? item.unitPrice - order.price : null,
        quantityDivergence: order ? item.quantity - order.quantity : null,
        orderQuantity: order?.quantity ?? null,
        orderPrice: order?.price ?? null,
        productDescription:
          productMap.get(item.productId ?? '')?.description ?? null
      }
    })
  }, [invoice, ordersForSupplier, productMap])

  const missingOrders = useMemo(
    () =>
      ordersForSupplier.filter(
        (o) => !invoice?.items.some((item) => item.productId === o.productId)
      ),
    [ordersForSupplier, invoice]
  )

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
    selectedQuoteId,
    handleQuoteChange,
    itemsWithDivergences,
    missingOrders,
    productMap,
    handleApprove,
    handleMarkDivergent,
    handleBack
  }
}
