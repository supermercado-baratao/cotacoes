import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { TProductDraft } from '@/components'
import type { TInvoice, TInvoiceItem, TOrder, TProduct, TQuote } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'
import { findSupplierByCnpj } from '@/utils'

import { findBestQuoteItemMatch } from '../utils'

export type TLinkOrderRow = {
  item: TInvoiceItem
  productId: string | null
  quoteItemId: string
}

export const useLinkOrdersDialogHandler = (
  isOpened: boolean,
  invoice: TInvoice,
  quote: TQuote | null,
  handleClose: () => void
) => {
  const { products, suppliers, createOrdersBatchWithInvoiceLink } =
    useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

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
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpened && !wasOpenRef.current) {
      setOverrides({})
      setProductOverrides({})
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

  const handleRowQuoteItemChange = (itemNumber: number, quoteItemId: string) =>
    setOverrides((prev) => ({ ...prev, [itemNumber]: quoteItemId }))

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

    const matches = rows.filter(isRowReady).map((r) => ({
      itemNumber: r.item.itemNumber,
      order: {
        quoteId: quote.id,
        quoteItemId: r.quoteItemId,
        productId: r.productId!,
        invoiceId: invoice.id,
        price: r.item.unitPrice,
        quantity: r.item.quantity,
        packing: r.item.unit,
        packingQuantity: null,
        supplierId: supplier.id,
        sellerId: null,
        date: dayjs(invoice.emissionDate).format('YYYY-MM-DD'),
        observations: null
      } as TCreateData<TOrder>
    }))

    setSuccessCallbacks([handleClose])
    createOrdersBatchWithInvoiceLink({ invoice, matches })
  }

  return {
    quote,
    supplier,
    products: products ?? [],
    rows,
    selectedCount,
    handleRowQuoteItemChange,
    handleRowProductChange,
    handleQuickCreateProduct,
    quickCreateDraft,
    isQuickCreateOpen,
    handleQuickCreateClose,
    handleProductCreated,
    quickCreateFamily,
    setQuickCreateFamily,
    handleConfirm
  }
}
