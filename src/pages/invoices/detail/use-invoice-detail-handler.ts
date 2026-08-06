import dayjs from 'dayjs'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'

import { useDeleteHandler } from '@/hooks'
import type { TInvoice, TInvoiceItem, TInvoiceItemMatchStatus } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import { buildPackageBarcodeLinkMap, findSupplierByCnpj } from '@/utils'

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
    quotes,
    quoteId,
    ordersByQuoteId,
    packageBarcodeLinks,
    setQuoteId,
    updateInvoice,
    deleteInvoice
  } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const invoice = useMemo(
    () => invoices?.find((inv) => inv.id === id) ?? null,
    [invoices, id]
  )

  const isFetching = invoices === null

  const sortedQuotes = useMemo(
    () => [...(quotes ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [quotes]
  )

  const selectedQuote = useMemo(
    () => sortedQuotes.find((q) => q.id === quoteId) ?? null,
    [sortedQuotes, quoteId]
  )

  const hasAutoSelectedQuote = useRef(false)

  useEffect(() => {
    if (hasAutoSelectedQuote.current || !invoice || !sortedQuotes.length) return
    hasAutoSelectedQuote.current = true
    const invoiceDate = dayjs(invoice.emissionDate).format('YYYY-MM-DD')
    const bestGuess = sortedQuotes.find((q) => q.date <= invoiceDate)
    if (bestGuess) setQuoteId(bestGuess.id)
  }, [invoice, sortedQuotes, setQuoteId])

  const productMap = useMemo(
    () => new Map(products?.map((p) => [p.id, p]) ?? []),
    [products]
  )

  const packageBarcodeLinkMap = useMemo(
    () => buildPackageBarcodeLinkMap(packageBarcodeLinks ?? []),
    [packageBarcodeLinks]
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
      const order = item.orderId
        ? (ordersForSupplier.find((o) => o.id === item.orderId) ?? null)
        : null

      const productId =
        item.productId ??
        (item.packageBarcode
          ? (packageBarcodeLinkMap.get(item.packageBarcode) ?? null)
          : null)

      const matchStatus: TInvoiceItemMatchStatus = !productId
        ? 'unmatched_product'
        : !order
          ? 'unmatched_order'
          : 'matched'

      return {
        ...item,
        productId,
        matchStatus,
        orderId: order?.id ?? null,
        priceDivergence: order ? item.unitPrice - order.price : null,
        quantityDivergence: order ? item.quantity - order.quantity : null,
        orderQuantity: order?.quantity ?? null,
        orderPrice: order?.price ?? null,
        productDescription: productMap.get(productId ?? '')?.description ?? null
      }
    })
  }, [invoice, ordersForSupplier, productMap, packageBarcodeLinkMap])

  const handleQuoteChange = (quoteId: string | null) => {
    setQuoteId(quoteId)
  }

  const handleApprove = () => {
    if (!invoice) return
    setSuccessCallbacks([handleBack])
    updateInvoice({ ...invoice, verificationStatus: 'approved' })
  }

  const handleMarkDivergent = () => {
    if (!invoice) return
    updateInvoice({ ...invoice, verificationStatus: 'divergent' })
  }

  const handleBack = () => navigate('/invoices')

  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TInvoice>((item) => {
    setSuccessCallbacks([handleBack])
    deleteInvoice(item.id)
  })

  return {
    invoice,
    isFetching,
    products: products ?? [],
    quotes: sortedQuotes,
    selectedQuoteId: quoteId,
    selectedQuote,
    itemsWithDivergences,
    productMap,
    itemToDelete,
    handleQuoteChange,
    handleApprove,
    handleMarkDivergent,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handleBack
  }
}
