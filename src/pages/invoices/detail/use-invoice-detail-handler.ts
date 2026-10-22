import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { useDeleteHandler } from '@/hooks/use-delete-handler'
import type {
  TInvoice,
  TInvoiceItem,
  TInvoiceItemMatchStatus
} from '@/models/invoice-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { getEntryUnitCost, type TPackQuantitySource } from '@/utils/entry-cost'
import { normalizeCnpj } from '@/utils/formatters'
import {
  evaluateMargin,
  getMarginPercent,
  getMarginTolerance,
  type TMarginStatus
} from '@/utils/margin'
import { buildPackageBarcodeLinkMap } from '@/utils/package-barcode-links'
import { findSupplierByCnpj, isSupplierCnpjIgnored } from '@/utils/suppliers'

import { filterInvoiceItemRows } from './utils'

export type TInvoiceItemRow = TInvoiceItem & {
  orderQuantity: number | null
  orderPrice: number | null
  orderPackingQuantity: number | null
  productDescription: string | null
  salePrice: number | null
  packQuantity: number | null
  packQuantitySource: TPackQuantitySource | null
  isBonus: boolean
  correctedPackQuantity: number | null
  unitCostWithTax: number | null
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
    packingDefaults,
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
    () => (quotes ?? []).toSorted((a, b) => b.date.localeCompare(a.date)),
    [quotes]
  )

  const selectedQuote = useMemo(
    () => sortedQuotes.find((q) => q.id === quoteId) ?? null,
    [sortedQuotes, quoteId]
  )

  const hasAutoSelectedQuote = useRef(false)

  useEffect(() => {
    if (!invoice || hasAutoSelectedQuote.current || sortedQuotes.length === 0)
      return
    hasAutoSelectedQuote.current = true
    const invoiceDate = dayjs(invoice.emissionDate).format('YYYY-MM-DD')
    const bestGuess = sortedQuotes.find((q) => q.date <= invoiceDate)
    if (bestGuess) setQuoteId(bestGuess.id)
  }, [invoice, sortedQuotes, setQuoteId])

  const productMap = useMemo(
    () => new Map(products?.map((p) => [p.id, p])),
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

      const matchStatus: TInvoiceItemMatchStatus = productId
        ? order
          ? 'matched'
          : 'unmatched_order'
        : 'unmatched_product'

      const product = productMap.get(productId ?? '') ?? null
      const orderPrice = order?.price ?? null
      const salePrice = product?.price ?? null
      const entryCost = product
        ? getEntryUnitCost(
            invoice,
            item,
            product,
            supplier?.id ?? null,
            packingDefaults ?? []
          )
        : null
      const isPackCorrected = entryCost?.source === 'manual'
      // Same default as the Dashboard: a corrected packing means the VR cost
      // is likely wrong too.
      const cost =
        isPackCorrected && entryCost.unitCost != null
          ? entryCost.unitCost
          : (product?.costWithTax ?? null)

      const marginStatus: TMarginStatus | null =
        product && salePrice && cost != null
          ? evaluateMargin(
              getMarginPercent(salePrice, cost),
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
        packQuantity: entryCost?.packQuantity ?? null,
        packQuantitySource: entryCost?.source ?? null,
        isBonus: entryCost?.isBonus ?? false,
        correctedPackQuantity: isPackCorrected ? entryCost.packQuantity : null,
        unitCostWithTax: entryCost?.unitCost ?? null,
        marginStatus
      }
    })
  }, [
    invoice,
    ordersForSupplier,
    productMap,
    packageBarcodeLinkMap,
    supplier,
    packingDefaults,
    settings
  ])

  const [search, setSearch] = useState('')
  const [packCorrectionRow, setPackCorrectionRow] =
    useState<TInvoiceItemRow | null>(null)

  const handlePackCorrectionDialogOpen = (row: TInvoiceItemRow) => {
    setPackCorrectionRow(row)
  }

  const handlePackCorrectionDialogClose = () => {
    setPackCorrectionRow(null)
  }

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
  const hasUnlinkedItems = itemsWithDivergences.some(
    (item) => item.orderId === null
  )

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
    supplier,
    hasUnlinkedItems,
    isSupplierIgnored,
    itemToDelete,
    packCorrectionRow,
    handleQuoteChange,
    handleApprove,
    handleMarkDivergent,
    handleIgnoreSupplier,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handlePackCorrectionDialogOpen,
    handlePackCorrectionDialogClose,
    handleBack
  }
}
