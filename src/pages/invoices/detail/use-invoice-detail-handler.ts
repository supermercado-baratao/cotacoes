import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { useDeleteHandler } from '@/hooks'
import type { TInvoice, TInvoiceItem, TInvoiceItemMatchStatus } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import {
  buildPackageBarcodeLinkMap,
  evaluateMargin,
  findSupplierByCnpj,
  getMarginTolerance,
  isSupplierCnpjIgnored,
  normalizeCnpj,
  type TMarginStatus
} from '@/utils'

import { filterInvoiceItemRows } from './utils'

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
  const location = useLocation()

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

      const product = productMap.get(productId ?? '') ?? null
      const orderPrice = order?.price ?? null
      const salePrice = product?.price ?? null
      const cost = product ? product.costWithTax : null

      const marginStatus: TMarginStatus | null =
        product && salePrice && cost != null
          ? evaluateMargin(
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
  }, [invoice, ordersForSupplier, productMap, packageBarcodeLinkMap, settings])

  const [search, setSearch] = useState('')

  const filteredItems = useMemo(
    () => filterInvoiceItemRows(search, itemsWithDivergences),
    [search, itemsWithDivergences]
  )

  const handleQuoteChange = (quoteId: string | null) => {
    setQuoteId(quoteId)
  }

  // Baseado em todos os itens da nota, não só nos filtrados pela busca — a
  // busca é só uma lente sobre a tabela, não deve mudar se a nota pode ser
  // aprovada.
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

  // `location.key === 'default'` só ocorre na entrada inicial do histórico
  // desta aba (acesso direto pela URL, sem navegação prévia dentro do app) —
  // nesses casos não há pra onde voltar, então cai na lista. Nos demais, back
  // navega pro histórico real: lista de Notas ou o botão "ver nota" de onde
  // o usuário veio (Dashboard, cotações, etc.).
  const handleBack = () => {
    if (location.key === 'default') {
      navigate('/invoices')
      return
    }
    navigate(-1)
  }

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
    itemsWithDivergences: filteredItems,
    search,
    setSearch,
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
