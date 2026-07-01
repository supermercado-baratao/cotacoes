import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'

import type { TInvoiceItem, TInvoiceItemMatchStatus } from '@/models'
import { useAppStore } from '@/stores'
import { findSupplierByCnpj } from '@/utils'

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
    suppliers,
    ordersByQuoteId,
    setQuoteId,
    updateInvoice
  } = useAppStore()

  const invoice = useMemo(
    () => invoices?.find((inv) => inv.id === id) ?? null,
    [invoices, id]
  )

  const isFetching = invoices === null

  const productMap = useMemo(
    () => new Map(products?.map((p) => [p.id, p]) ?? []),
    [products]
  )

  const supplier = useMemo(
    () =>
      invoice
        ? findSupplierByCnpj(invoice.supplierCnpj, suppliers ?? [])
        : null,
    [invoice, suppliers]
  )

  const ordersForSupplier = useMemo(
    () => (ordersByQuoteId ?? []).filter((o) => o.supplierId === supplier?.id),
    [ordersByQuoteId, supplier?.id]
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

  const handleQuoteChange = (quoteId: string | null) => {
    setQuoteId(quoteId)
  }

  const handleApprove = () => {
    if (!invoice) return
    updateInvoice({ ...invoice, verificationStatus: 'approved' })
  }

  const handleMarkDivergent = () => {
    if (!invoice) return
    updateInvoice({ ...invoice, verificationStatus: 'divergent' })
  }

  const handleBack = () => navigate('/invoices')

  return {
    invoice,
    isFetching,
    products: products ?? [],
    itemsWithDivergences,
    productMap,
    handleQuoteChange,
    handleApprove,
    handleMarkDivergent,
    handleBack
  }
}
