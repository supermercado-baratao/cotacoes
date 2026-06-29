import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { useDeleteHandler, useFormState } from '@/hooks'
import type { TProduct, TQuote } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { printQuote } from './pdf/print-quote'
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
    ordersByQuoteId,
    suppliers,
    products,
    families,
    setQuoteId,
    deleteQuote
  } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const availableYears = getAvailableYears(quotes || [])
  const [year, setYear] = useState(availableYears[0])

  const availableMonths = getAvailableMonths(quotes || [], year)
  const [month, setMonth] = useState(availableMonths[0])

  const availableDays = getAvailableDays(quotes || [], year, month)
  const [day, setDay] = useState(availableDays[0])

  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !quotes?.length) return
    initialized.current = true
    const latest = [...quotes].sort((a, b) =>
      dayjs(b.date).diff(dayjs(a.date))
    )[0]
    setYear(dayjs(latest.date).year())
    setMonth(dayjs(latest.date).month() + 1)
    setDay(dayjs(latest.date).date())
  }, [quotes])

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

  const handleSuccess = (date: string) => {
    setYear(dayjs(date).year())
    setMonth(dayjs(date).month() + 1)
    setDay(dayjs(date).date())
  }

  const {
    itemToDelete: quoteToDelete,
    handleDelete: handleDeleteQuote,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TQuote>((quote) => {
    const remaining = (quotes ?? []).filter((q) => q.id !== quote.id)
    if (remaining.length) {
      const latest = [...remaining].sort((a, b) =>
        dayjs(b.date).diff(dayjs(a.date))
      )[0]
      setSuccessCallbacks([() => handleSuccess(latest.date)])
    }
    deleteQuote(quote.id)
  })

  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [isAiReferenceOpen, setIsAiReferenceOpen] = useState(false)
  const [isNfImportOpen, setIsNfImportOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [search, setSearch] = useState('')

  const handleAiReferenceOpen = () => setIsAiReferenceOpen(true)
  const handleAiReferenceClose = () => setIsAiReferenceOpen(false)
  const handleNfImportOpen = () => setIsNfImportOpen(true)
  const handleNfImportClose = () => setIsNfImportOpen(false)

  const handlePrint = async () => {
    if (!quote || !products || !families) return
    setIsPrinting(true)
    await new Promise((resolve) => setTimeout(resolve, 0))
    try {
      await printQuote(quote, products, families)
    } finally {
      setIsPrinting(false)
    }
  }

  const quote = getSelectedQuote(quotes || [], year, month, day) ?? null
  const numberOfSuppliers = getNumberOfSuppliers(ordersByQuoteId || [])

  const quoteRows =
    quote && suppliers
      ? getQuoteRows(quote, ordersByQuoteId || [], suppliers)
      : []

  useEffect(() => {
    setQuoteId(quote?.id ?? null)
  }, [quote, setQuoteId])

  const onYearChange = (year: number) => setYear(year)
  const onMonthChange = (month: number) => setMonth(month)
  const onDayChange = (day: number) => setDay(day)

  const isFetching = quotes === null
  const hasQuoteRows = !!quoteRows.length

  const filteredRows = search
    ? quoteRows.filter((row) =>
        row.description.toLowerCase().includes(search.toLowerCase())
      )
    : quoteRows

  return {
    isFetching,
    quote,
    hasQuoteRows,
    quoteRows: filteredRows,
    search,
    setSearch,
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
    isAiReferenceOpen,
    handleAiReferenceOpen,
    handleAiReferenceClose,
    isNfImportOpen,
    handleNfImportOpen,
    handleNfImportClose,
    handlePrint,
    isPrinting,
    numberOfSuppliers,
    handleSuccess,
    quoteToDelete,
    handleDeleteQuote,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
