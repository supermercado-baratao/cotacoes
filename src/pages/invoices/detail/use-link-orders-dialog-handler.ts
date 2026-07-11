import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { TInvoice, TInvoiceItem, TOrder, TQuote } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'
import { findBestQuoteItemMatch, findSupplierByCnpj } from '@/utils'

export type TLinkOrderRow = {
  item: TInvoiceItem
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
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpened && !wasOpenRef.current) setOverrides({})
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
    () =>
      invoice.items.filter((i) => i.productId !== null && i.orderId === null),
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
          quoteItemId: overrides[item.itemNumber] ?? bestMatch?.id ?? ''
        }
      }),
    [unlinkedItems, quote, productMap, overrides]
  )

  const handleRowQuoteItemChange = (itemNumber: number, quoteItemId: string) =>
    setOverrides((prev) => ({ ...prev, [itemNumber]: quoteItemId }))

  const selectedCount = rows.filter((r) => r.quoteItemId !== '').length

  const handleConfirm = () => {
    if (!quote || !supplier || selectedCount === 0) return

    const matches = rows
      .filter((r) => r.quoteItemId !== '')
      .map((r) => ({
        itemNumber: r.item.itemNumber,
        order: {
          quoteId: quote.id,
          quoteItemId: r.quoteItemId,
          productId: r.item.productId!,
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
    rows,
    selectedCount,
    handleRowQuoteItemChange,
    handleConfirm
  }
}
