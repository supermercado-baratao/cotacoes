import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { TQuote } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  quote: TQuote | null,
  setFormQuote: (quote: TQuote | null) => void,
  handleClose: () => void
) => {
  const { createQuote, updateQuote, products } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [productSearch, setProductSearch] = useState('')

  const defaultValues: TSchema = useMemo(
    () => ({
      date: quote?.date ?? dayjs().format('YYYY-MM-DD'),
      products: quote?.products ?? [],
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
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const selectedProducts = useWatch({ control, name: 'products' })

  const filteredProducts = useMemo(() => {
    if (!products) return []
    if (!productSearch.trim()) return products
    return products.filter((p) =>
      p.description.toLowerCase().includes(productSearch.toLowerCase())
    )
  }, [products, productSearch])

  const handleProductToggle = (productId: string) => {
    const current = selectedProducts ?? []
    if (current.includes(productId)) {
      setValue(
        'products',
        current.filter((id) => id !== productId)
      )
    } else {
      setValue('products', [...current, productId])
    }
  }

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
    productSearch,
    setProductSearch,
    filteredProducts,
    selectedProducts: selectedProducts ?? [],
    handleProductToggle
  }
}
