import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TQuote, TQuoteItem, TQuoteItemType } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  quote: TQuote | null,
  setFormQuote: (quote: TQuote | null) => void,
  handleClose: () => void
) => {
  const { createQuote, updateQuote, products, families, groups } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TQuoteItemType>('product')

  const defaultValues: TSchema = useMemo(
    () => ({
      date: quote?.date ?? dayjs().format('YYYY-MM-DD'),
      items: quote?.items ?? [],
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
    control,
    setValue,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const selectedItems = useWatch({ control, name: 'items' }) ?? []

  const isSelected = (id: string) => selectedItems.some((i) => i.id === id)

  const handleItemToggle = (id: string, type: TQuoteItemType) => {
    if (isSelected(id)) {
      setValue(
        'items',
        selectedItems.filter((i) => i.id !== id)
      )
    } else {
      setValue('items', [...selectedItems, { id, type } satisfies TQuoteItem])
    }
  }

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (activeTab === 'product') {
      const list = products ?? []
      return term
        ? list.filter((p) => p.description.toLowerCase().includes(term))
        : list
    }
    if (activeTab === 'family') {
      const list = families ?? []
      return term
        ? list.filter((f) => f.description.toLowerCase().includes(term))
        : list
    }
    const list = groups ?? []
    return term
      ? list.filter((g) => g.description.toLowerCase().includes(term))
      : list
  }, [activeTab, search, products, families, groups])

  const onSubmit = handleSubmit((data) => {
    if (quote) {
      setSuccessCallbacks([handleClose, () => setFormQuote(null)])
      updateQuote({ ...quote, ...data })
      return
    }
    setSuccessCallbacks([handleClose, () => reset(defaultValues)])
    createQuote(data)
  })

  return {
    register,
    onSubmit,
    errors,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    filteredOptions,
    isSelected,
    handleItemToggle,
    selectedCount: selectedItems.length
  }
}
