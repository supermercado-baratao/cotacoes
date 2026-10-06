import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TQuote, TQuoteItem } from '@/models/quote-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  quote: TQuote | null,
  setFormQuote: (quote: TQuote | null) => void,
  handleClose: () => void,
  handleSuccess: (date: string) => void
) => {
  const { createQuote, updateQuote, ordersByQuoteId } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      date: quote?.date ?? dayjs().format('YYYY-MM-DD'),
      lines: quote?.items.map((i) => i.description).join('\n') ?? '',
      observations: quote?.observations ?? null,
      status: quote?.status ?? 'opened',
      orders: quote?.orders ?? []
    }),
    [quote]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const parseItems = (lines: string, existing: TQuoteItem[]): TQuoteItem[] => {
    const existingByDesc = new Map(
      existing.map((i) => [i.description.trim().toLowerCase(), i])
    )
    return lines
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((description) => {
        const match = existingByDesc.get(description.toLowerCase())
        return {
          id: match?.id ?? crypto.randomUUID(),
          description,
          salePrice: match?.salePrice ?? null,
          priceRef: match?.priceRef ?? null
        }
      })
  }

  const onSubmit = handleSubmit(({ lines, ...rest }) => {
    const items = parseItems(lines, quote?.items ?? [])
    if (quote) {
      const removedItemIds = new Set(
        quote.items
          .filter((old) => !items.some((i) => i.id === old.id))
          .map((old) => old.id)
      )
      const ordersToDelete = removedItemIds.size
        ? (ordersByQuoteId ?? []).filter((o) =>
            removedItemIds.has(o.quoteItemId)
          )
        : []
      setSuccessCallbacks([
        handleClose,
        () => setFormQuote(null),
        () => handleSuccess(rest.date)
      ])
      updateQuote({ ...quote, ...rest, items }, ordersToDelete)
      return
    }
    setSuccessCallbacks([
      handleClose,
      () => reset(defaultValues),
      () => handleSuccess(rest.date)
    ])
    createQuote({ ...rest, items })
  })

  return { register, onSubmit, errors }
}
