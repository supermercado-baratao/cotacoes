import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TProduct, TQuote } from '@/models'
import { useAppStore } from '@/stores'

import {
  getAvailableDays,
  getAvailableMonths,
  getAvailableYears,
  getNumberOfSuppliers,
  getQuoteRows,
  getSelectedQuote
} from './utils'

export const useQuotesHandler = () => {
  const {
    quotes,
    products,
    families,
    groups,
    ordersByQuoteId,
    suppliers,
    setQuoteId
  } = useAppStore()

  const availableYears = getAvailableYears(quotes || [])
  const [year, setYear] = useState(availableYears[0])

  const availableMonths = getAvailableMonths(quotes || [], year)
  const [month, setMonth] = useState(availableMonths[0])

  const availableDays = getAvailableDays(quotes || [], year, month)
  const [day, setDay] = useState(availableDays[0])

  const {
    formItem: formQuote,
    setFormItem: setFormQuote,
    isFormOpen: isQuoteFormOpen,
    handleFormOpen: handleQuoteFormOpen,
    handleFormClose: handleQuoteFormClose
  } = useFormState<TQuote>()

  const {
    formItem: formProduct,
    setFormItem: setFormProduct,
    isFormOpen: isProductFormOpen,
    handleFormOpen: handleProductFormOpen,
    handleFormClose: handleProductFormClose
  } = useFormState<TProduct>()

  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [quickCreateGroup, setQuickCreateGroup] = useState(false)

  const quote = getSelectedQuote(quotes || [], year, month, day) ?? null
  const numberOfSuppliers = getNumberOfSuppliers(ordersByQuoteId || [])

  const quoteRows =
    quote && products && families && groups && suppliers
      ? getQuoteRows(
          quote,
          products,
          families,
          groups,
          ordersByQuoteId || [],
          suppliers
        )
      : []

  useEffect(() => {
    setQuoteId(quote?.id ?? null)
  }, [quote, setQuoteId])

  const onYearChange = (year: number) => setYear(year)
  const onMonthChange = (month: number) => setMonth(month)
  const onDayChange = (day: number) => setDay(day)

  const handleCreateQuote = (date: string) => {
    setYear(dayjs(date).year())
    setMonth(dayjs(date).month())
    setDay(dayjs(date).date())
  }

  const isFetching = quotes === null
  const hasQuoteRows = !!quoteRows.length

  return {
    isFetching,
    quote,
    hasQuoteRows,
    quoteRows,
    availableYears,
    year,
    onYearChange,
    availableMonths,
    month,
    onMonthChange,
    availableDays,
    day,
    onDayChange,
    formQuote,
    setFormQuote,
    isQuoteFormOpen,
    handleQuoteFormOpen,
    handleQuoteFormClose,
    formProduct,
    setFormProduct,
    isProductFormOpen,
    handleProductFormOpen,
    handleProductFormClose,
    quickCreateFamily,
    setQuickCreateFamily,
    quickCreateGroup,
    setQuickCreateGroup,
    numberOfSuppliers,
    handleCreateQuote
  }
}
