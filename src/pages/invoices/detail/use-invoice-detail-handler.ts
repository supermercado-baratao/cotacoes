import dayjs from 'dayjs'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'

import { useDeleteHandler } from '@/hooks'
import type { TInvoice, TInvoiceItem, TInvoiceItemMatchStatus } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import {
  buildPackageBarcodeLinkMap,
  buildRecentCostMap,
  evaluateMargin,
  findSupplierByCnpj,
  getMarginTolerance,
  isSupplierCnpjIgnored,
  normalizeCnpj,
  resolveProductCost,
  type TMarginStatus
} from '@/utils'

export type TInvoiceItemRow = TInvoiceItem & {
  orderQuantity: number | null
  orderPrice: number | null
  orderPackingQuantity: number | null
  productDescription: string | null
  salePrice: number | null
  marginStatus: TMarginStatus | null
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
    settings,
    recentInvoices,
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

  // Mesma fonte de custo usada em Dashboard/Products/Price-Adjustments (média
  // das notas de entrada recentes, com fallback pro custo do catálogo) — evita
  // que a mesma badge de margem diverja entre telas por usar fontes de custo
  // diferentes.
  const recentCostMap = useMemo(
    () => buildRecentCostMap(recentInvoices ?? []),
    [recentInvoices]
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

      const product = productMap.get(productId ?? '') ?? null
      const orderPrice = order?.price ?? null
      const salePrice = product?.price ?? null
      const cost = product ? resolveProductCost(product, recentCostMap) : null

      const marginStatus: TMarginStatus | null =
        product?.margin != null && salePrice && cost != null
          ? evaluateMargin(
              product.margin,
              ((salePrice - cost) / salePrice) * 100,
              getMarginTolerance(settings, product.departmentId)
            ).status
          : null

      return {
        ...item,
        productId,
        matchStatus,
        orderId: order?.id ?? null,
        priceDivergence: order ? item.unitPrice - order.price : null,
        quantityDivergence: order ? item.quantity - order.quantity : null,
        orderQuantity: order?.quantity ?? null,
        orderPrice,
        orderPackingQuantity: order?.packingQuantity ?? null,
        productDescription: product?.description ?? null,
        salePrice,
        marginStatus
      }
    })
  }, [
    invoice,
    ordersForSupplier,
    productMap,
    packageBarcodeLinkMap,
    recentCostMap,
    settings
  ])

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
