import dayjs from 'dayjs'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'

import { useDeleteHandler } from '@/hooks'
import type { TInvoice, TInvoiceItem, TInvoiceItemMatchStatus } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import {
  buildPackageBarcodeLinkMap,
  findSupplierByCnpj,
  isSupplierCnpjIgnored,
  normalizeCnpj
} from '@/utils'

export type TInvoiceItemRow = TInvoiceItem & {
  orderQuantity: number | null
  orderPrice: number | null
  orderPackingQuantity: number | null
  productDescription: string | null
  salePrice: number | null
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
    ignoredSuppliers,
    setQuoteId,
    updateInvoice,
    deleteInvoice,
    createIgnoredSupplier
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

  const orderMap = useMemo(
    () => new Map(ordersForSupplier.map((o) => [o.id, o])),
    [ordersForSupplier]
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
        orderPackingQuantity: order?.packingQuantity ?? null,
        productDescription:
          productMap.get(productId ?? '')?.description ?? null,
        salePrice: productMap.get(productId ?? '')?.price ?? null
      }
    })
  }, [invoice, ordersForSupplier, productMap, packageBarcodeLinkMap])

  const handleQuoteChange = (quoteId: string | null) => {
    setQuoteId(quoteId)
  }

  const hasUnlinkedItems = itemsWithDivergences.some((i) => i.orderId === null)

  const handleApprove = () => {
    if (!invoice || hasUnlinkedItems) return
    setSuccessCallbacks([handleBack])
    updateInvoice({ ...invoice, verificationStatus: 'approved' })
  }

  const handleMarkDivergent = () => {
    if (!invoice) return
    updateInvoice({ ...invoice, verificationStatus: 'divergent' })
  }

  const isSupplierIgnored = invoice
    ? isSupplierCnpjIgnored(invoice.supplierCnpj, ignoredSuppliers ?? [])
    : false

  const handleIgnoreSupplier = () => {
    if (!invoice || isSupplierIgnored) return
    createIgnoredSupplier({
      id: normalizeCnpj(invoice.supplierCnpj),
      cnpj: invoice.supplierCnpj,
      name: supplier?.tradeName ?? invoice.supplierName
    })
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
    orderMap,
    hasUnlinkedItems,
    isSupplierIgnored,
    itemToDelete,
    handleQuoteChange,
    handleApprove,
    handleMarkDivergent,
    handleIgnoreSupplier,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handleBack
  }
}
