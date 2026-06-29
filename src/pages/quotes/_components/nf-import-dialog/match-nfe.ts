import dayjs from 'dayjs'

import type { TOrder, TProduct, TQuote } from '@/models'
import type { TCreateData } from '@/types'
import type { TParsedNfe } from '@/utils'

export type TMatchedOrder = TCreateData<TOrder> & {
  nfAccessKey: string
  nfNumber: string
  nfSupplierName: string
  quoteItemDescription: string
}

export type TUnmatchedItem = {
  nfAccessKey: string
  nfNumber: string
  nfSupplierName: string
  description: string
  reason: 'no_product' | 'no_supplier' | 'no_quote_item' | 'out_of_range'
}

export type TMatchResult = {
  matched: TMatchedOrder[]
  unmatched: TUnmatchedItem[]
}

const nfeDateStr = (emissionDate: string): string =>
  dayjs(emissionDate).format('YYYY-MM-DD')

export const matchNfesToOrders = (
  parsedNfes: TParsedNfe[],
  quote: TQuote,
  products: TProduct[],
  nextQuoteDate: string | null
): TMatchResult => {
  const productToQuoteItemId = new Map<string, string>()

  // Family-based matches first (lower priority — overridden by direct product refs below)
  for (const quoteItem of quote.items) {
    const ref = quoteItem.priceRef
    if (ref?.type === 'family') {
      for (const product of products) {
        if (product.familyId === ref.id) {
          productToQuoteItemId.set(product.id, quoteItem.id)
        }
      }
    }
  }

  // Direct product refs override family matches
  for (const quoteItem of quote.items) {
    const ref = quoteItem.priceRef
    if (ref?.type === 'product') {
      productToQuoteItemId.set(ref.id, quoteItem.id)
    }
  }

  const quoteItemDescriptions = new Map(
    quote.items.map((i) => [i.id, i.description])
  )

  const matched: TMatchedOrder[] = []
  const unmatched: TUnmatchedItem[] = []

  for (const nfe of parsedNfes) {
    const nfMeta = {
      nfAccessKey: nfe.accessKey,
      nfNumber: nfe.number,
      nfSupplierName: nfe.supplierName || nfe.supplierCnpj
    }

    const nfeDate = nfeDateStr(nfe.emissionDate)
    const isInRange =
      nfeDate >= quote.date &&
      (nextQuoteDate === null || nfeDate < nextQuoteDate)

    if (!isInRange) {
      for (const item of nfe.items) {
        unmatched.push({
          ...nfMeta,
          description: item.description,
          reason: 'out_of_range'
        })
      }
      continue
    }

    for (const item of nfe.items) {
      if (!item.productId) {
        unmatched.push({
          ...nfMeta,
          description: item.description,
          reason: 'no_product'
        })
        continue
      }

      if (!nfe.supplierId) {
        unmatched.push({
          ...nfMeta,
          description: item.description,
          reason: 'no_supplier'
        })
        continue
      }

      const quoteItemId = productToQuoteItemId.get(item.productId)
      if (!quoteItemId) {
        unmatched.push({
          ...nfMeta,
          description: item.description,
          reason: 'no_quote_item'
        })
        continue
      }

      matched.push({
        ...nfMeta,
        quoteItemDescription: quoteItemDescriptions.get(quoteItemId) ?? '',
        quoteId: quote.id,
        quoteItemId,
        productId: item.productId,
        supplierId: nfe.supplierId,
        sellerId: null,
        invoiceId: nfe.accessKey,
        date: dayjs(nfe.emissionDate).format('YYYY-MM-DD'),
        price: item.unitPrice,
        quantity: item.quantity,
        packing: item.unit,
        observations: null
      })
    }
  }

  return { matched, unmatched }
}
