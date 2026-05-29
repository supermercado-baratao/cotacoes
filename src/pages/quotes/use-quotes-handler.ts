import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TOrder, TProduct, TQuote } from '@/models'
import { useAppStore } from '@/stores'

import {
  getAvailableDays,
  getAvailableMonths,
  getAvailableYears,
  getNumberOfSuppliers,
  getQuoteProducts,
  getQuoteRows,
  getSelectedQuote,
  type TQuoteRow
} from './utils'

export const useQuotesHandler = () => {
  const { quotes, products, ordersByQuoteId, suppliers, setQuoteId } =
    useAppStore()

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

  const {
    formItem: formOrder,
    setFormItem: setFormOrder,
    isFormOpen: isOrderFormOpen,
    handleFormOpen: handleOrderFormOpen,
    handleFormEdit: handleOrderFormEdit,
    handleFormClose: handleOrderFormClose
  } = useFormState<TOrder>()

  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [orderProductId, setOrderProductId] = useState<string | null>(null)

  const quote = getSelectedQuote(quotes || [], year, month, day) ?? null

  const numberOfSuppliers = getNumberOfSuppliers(ordersByQuoteId || [])

  const quoteProducts = getQuoteProducts(quote?.products || [], products || [])

  const quoteRows = getQuoteRows(
    quoteProducts,
    ordersByQuoteId || [],
    suppliers || []
  )

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

  const handleOrderEdit = (row: TQuoteRow) => {
    setOrderProductId(row.id)
    if (row.orderId) {
      const order = ordersByQuoteId?.find((o) => o.id === row.orderId) ?? null
      if (order) handleOrderFormEdit(order)
    } else {
      handleOrderFormOpen()
    }
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
    formOrder,
    setFormOrder,
    isOrderFormOpen,
    orderProductId,
    handleOrderFormClose,
    handleOrderEdit,
    quickCreateFamily,
    setQuickCreateFamily,
    numberOfSuppliers,
    handleCreateQuote
  }
}
