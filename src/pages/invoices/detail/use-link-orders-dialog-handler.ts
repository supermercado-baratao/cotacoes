import { useEffect, useMemo, useRef, useState } from 'react'

import type { TProductDraft } from '@/components'
import type {
  TInvoice,
  TInvoiceItem,
  TProduct,
  TQuote,
  TQuoteItem
} from '@/models'
import { useAppStore } from '@/stores'
import { findSupplierByCnpj, getFamilyReferencePrice } from '@/utils'

import {
  findBestQuoteItemMatch,
  groupInvoiceItemsForBatch,
  type TBatchGroup,
  type TLinkOrderRow
} from '../utils'

export type TAddQuoteItemDraft = {
  itemNumber: number
  description: string
  productId: string | null
}

export type TQueueItem =
  | { type: 'batch'; group: TBatchGroup }
  | { type: 'individual'; row: TLinkOrderRow }

export const ROWS_PER_PAGE = 25

export const useLinkOrdersDialogHandler = (
  isOpened: boolean,
  invoice: TInvoice,
  quote: TQuote | null,
  handleClose: () => void
) => {
  const { products, suppliers, updateQuote } = useAppStore()

  const [overrides, setOverrides] = useState<Record<number, string>>({})
  const [productOverrides, setProductOverrides] = useState<
    Record<number, string>
  >({})
  const [quickCreateDraft, setQuickCreateDraft] =
    useState<TProductDraft | null>(null)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [quickCreateItemNumber, setQuickCreateItemNumber] = useState<
    number | null
  >(null)
  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [addQuoteItemDraft, setAddQuoteItemDraft] =
    useState<TAddQuoteItemDraft | null>(null)
  const [queue, setQueue] = useState<TQueueItem[]>([])
  const [page, setPage] = useState(0)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpened && !wasOpenRef.current) {
      setOverrides({})
      setProductOverrides({})
      setQueue([])
      setPage(0)
    }
    wasOpenRef.current = isOpened
  }, [isOpened])

  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p])),
    [products]
  )

  const supplier = useMemo(
    () => findSupplierByCnpj(invoice.supplierCnpj, suppliers ?? []),
    [invoice.supplierCnpj, suppliers]
  )

  const unlinkedItems = useMemo(
    () => invoice.items.filter((i) => i.orderId === null),
    [invoice.items]
  )

  const rows: TLinkOrderRow[] = useMemo(
    () =>
      unlinkedItems.map((item) => {
        const bestMatch = quote
          ? findBestQuoteItemMatch(item, quote.items, productMap)
          : null
        return {
          item,
          productId:
            item.productId ?? productOverrides[item.itemNumber] ?? null,
          quoteItemId: overrides[item.itemNumber] ?? bestMatch?.id ?? ''
        }
      }),
    [unlinkedItems, quote, productMap, overrides, productOverrides]
  )

  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE))
  const currentPage = Math.min(page, pageCount - 1)

  const pagedRows = useMemo(
    () =>
      rows.slice(
        currentPage * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
      ),
    [rows, currentPage]
  )

  const handleRowQuoteItemChange = (itemNumber: number, quoteItemId: string) =>
    setOverrides((prev) => ({ ...prev, [itemNumber]: quoteItemId }))

  const handleOpenAddQuoteItem = (row: TLinkOrderRow) =>
    setAddQuoteItemDraft({
      itemNumber: row.item.itemNumber,
      description: row.item.description,
      productId: row.productId
    })

  const handleAddQuoteItemDialogClose = () => setAddQuoteItemDraft(null)

  const handleConfirmAddQuoteItem = (description: string) => {
    if (!quote || !addQuoteItemDraft) return
    const trimmedDescription = description.trim()
    if (!trimmedDescription) return

    const product = addQuoteItemDraft.productId
      ? (productMap.get(addQuoteItemDraft.productId) ?? null)
      : null
    const priceRef: TQuoteItem['priceRef'] = product?.familyId
      ? { type: 'family', id: product.familyId }
      : product
        ? { type: 'product', id: product.id }
        : null
    const salePrice =
      priceRef?.type === 'family'
        ? getFamilyReferencePrice(products ?? [], priceRef.id)
        : (product?.price ?? null)

    const newItem: TQuoteItem = {
      id: crypto.randomUUID(),
      description: trimmedDescription,
      salePrice,
      priceRef
    }
    updateQuote({ ...quote, items: [...quote.items, newItem] })
    setOverrides((prev) => ({
      ...prev,
      [addQuoteItemDraft.itemNumber]: newItem.id
    }))
    setAddQuoteItemDraft(null)
  }

  const handleRowProductChange = (itemNumber: number, productId: string) =>
    setProductOverrides((prev) => ({ ...prev, [itemNumber]: productId }))

  const handleQuickCreateProduct = (item: TInvoiceItem) => {
    setQuickCreateDraft({
      description: item.description,
      barcode: item.barcode ?? item.calculatedBarcode ?? '',
      price: item.unitPrice
    })
    setQuickCreateItemNumber(item.itemNumber)
    setIsQuickCreateOpen(true)
  }

  const handleQuickCreateClose = () => setIsQuickCreateOpen(false)

  const handleProductCreated = (product: TProduct) => {
    if (quickCreateItemNumber !== null) {
      handleRowProductChange(quickCreateItemNumber, product.id)
    }
    setIsQuickCreateOpen(false)
  }

  const isRowReady = (row: TLinkOrderRow) =>
    row.productId !== null && row.quoteItemId !== ''

  const selectedCount = rows.filter(isRowReady).length

  const handleConfirm = () => {
    if (!quote || !supplier || selectedCount === 0) return

    const { batchGroups, individualRows } = groupInvoiceItemsForBatch(
      rows.filter(isRowReady),
      quote.items
    )

    setQueue([
      ...batchGroups.map((group): TQueueItem => ({ type: 'batch', group })),
      ...individualRows.map((row): TQueueItem => ({ type: 'individual', row }))
    ])
  }

  const advanceQueue = () => {
    const remaining = queue.slice(1)
    setQueue(remaining)
    if (remaining.length === 0) handleClose()
  }

  const currentQueueItem = queue[0] ?? null

  const currentQuoteItem = useMemo(() => {
    if (!currentQueueItem || !quote) return null
    const quoteItemId =
      currentQueueItem.type === 'batch'
        ? currentQueueItem.group.quoteItemId
        : currentQueueItem.row.quoteItemId
    return quote.items.find((qi) => qi.id === quoteItemId) ?? null
  }, [currentQueueItem, quote])

  return {
    quote,
    supplier,
    products: products ?? [],
    rows,
    pagedRows,
    page: currentPage,
    pageCount,
    setPage,
    selectedCount,
    handleRowQuoteItemChange,
    handleOpenAddQuoteItem,
    addQuoteItemDraft,
    handleAddQuoteItemDialogClose,
    handleConfirmAddQuoteItem,
    handleRowProductChange,
    handleQuickCreateProduct,
    quickCreateDraft,
    isQuickCreateOpen,
    handleQuickCreateClose,
    handleProductCreated,
    quickCreateFamily,
    setQuickCreateFamily,
    handleConfirm,
    currentQueueItem,
    currentQuoteItem,
    advanceQueue
  }
}
