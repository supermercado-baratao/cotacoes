import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TAiSuggestion } from '@/infra/gemini'
import type { TPriceRef, TQuote, TQuoteItem } from '@/models/quote/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { getFamilyReferencePrice } from '@/utils/quote-item-match'

import { schema, type TSchema } from './schema'

const getDefaultValues = (
  quoteItem: TQuoteItem | null,
  initialSuggestion: TAiSuggestion | null
): TSchema => ({
  familyId:
    quoteItem?.priceRef?.type === 'family'
      ? quoteItem.priceRef.id
      : initialSuggestion?.type === 'family'
        ? initialSuggestion.id
        : null,
  productId:
    quoteItem?.priceRef?.type === 'product'
      ? quoteItem.priceRef.id
      : initialSuggestion?.type === 'product'
        ? initialSuggestion.id
        : null,
  salePrice: quoteItem?.salePrice ?? null
})

export const useFormHandler = (
  quoteItem: TQuoteItem | null,
  quote: TQuote,
  handleClose: () => void,
  initialSuggestion: TAiSuggestion | null = null
) => {
  const { updateQuote, products, families } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const { control, handleSubmit, reset, setValue } = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(quoteItem, initialSuggestion)
  })

  useEffect(() => {
    reset(getDefaultValues(quoteItem, initialSuggestion))
  }, [quoteItem, initialSuggestion, reset])

  const watchedFamilyId = useWatch({ control, name: 'familyId' })
  const watchedProductId = useWatch({ control, name: 'productId' })

  useEffect(() => {
    if (!watchedFamilyId) return
    if (
      quoteItem?.priceRef?.type === 'family' &&
      quoteItem.priceRef.id === watchedFamilyId
    )
      return
    const price = getFamilyReferencePrice(products ?? [], watchedFamilyId)
    if (price != null) setValue('salePrice', price)
    setValue('productId', null)
  }, [watchedFamilyId, products, setValue, quoteItem])

  useEffect(() => {
    if (!watchedProductId) return
    if (
      quoteItem?.priceRef?.type === 'product' &&
      quoteItem.priceRef.id === watchedProductId
    )
      return
    const product = (products ?? []).find((p) => p.id === watchedProductId)
    if (product != null) setValue('salePrice', product.price)
    setValue('familyId', null)
  }, [watchedProductId, products, setValue, quoteItem])

  const onSubmit = handleSubmit(({ salePrice, familyId, productId }) => {
    if (!quoteItem) return
    const priceRef: TPriceRef = familyId
      ? { type: 'family', id: familyId }
      : productId
        ? { type: 'product', id: productId }
        : salePrice == null
          ? null
          : { type: 'manual' }
    setSuccessCallbacks([handleClose])
    updateQuote({
      ...quote,
      items: quote.items.map((item) =>
        item.id === quoteItem.id ? { ...item, salePrice, priceRef } : item
      )
    })
  })

  const priceComparison = (() => {
    const ref = quoteItem?.priceRef
    const quotedPrice = quoteItem?.salePrice
    if (!ref || quotedPrice == null || ref.type === 'manual') return null
    const currentPrice =
      ref.type === 'product'
        ? ((products ?? []).find((p) => p.id === ref.id)?.price ?? null)
        : getFamilyReferencePrice(products ?? [], ref.id)
    return currentPrice == null ? null : { quotedPrice, currentPrice }
  })()

  return {
    control,
    onSubmit,
    families: families ?? [],
    products: products ?? [],
    priceComparison
  }
}
