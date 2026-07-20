import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { useDeleteHandler, useFormState } from '@/hooks'
import type { TProduct, TQuote } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import { matchesSearch } from '@/utils'

import { printQuote } from './pdf/print-quote'
import {
  getAvailableDays,
  getAvailableMonths,
  getAvailableYears,
  getNextQuoteDate,
  getNumberOfSuppliers,
  getPendingInvoicesForQuote,
  getQuoteInvoiceDateRange,
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
    settings,
    invoices,
    invoiceDateRange,
    setInvoiceDateRange,
    setQuoteId,
    deleteQuote,
    quotesSelectedDate,
    setQuotesSelectedDate
  } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const availableYears = getAvailableYears(quotes || [])
  const [year, setYear] = useState(
    quotesSelectedDate?.year ?? availableYears[0]
  )

  const availableMonths = getAvailableMonths(quotes || [], year)
  const [month, setMonth] = useState(
    quotesSelectedDate?.month ?? availableMonths[0]
  )

  const availableDays = getAvailableDays(quotes || [], year, month)
  const [day, setDay] = useState(quotesSelectedDate?.day ?? availableDays[0])

  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !quotes?.length || quotesSelectedDate) return
    initialized.current = true
    const latest = [...quotes].sort((a, b) =>
      dayjs(b.date).diff(dayjs(a.date))
    )[0]
    setYear(dayjs(latest.date).year())
    setMonth(dayjs(latest.date).month() + 1)
    setDay(dayjs(latest.date).date())
  }, [quotes, quotesSelectedDate])

  useEffect(() => {
    setQuotesSelectedDate({ year, month, day })
  }, [year, month, day, setQuotesSelectedDate])

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
    const ordersToDelete = (ordersByQuoteId ?? []).filter(
      (o) => o.quoteId === quote.id
    )
    deleteQuote(quote.id, ordersToDelete)
  })

  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [isAiReferenceOpen, setIsAiReferenceOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [search, setSearch] = useState('')

  const handleAiReferenceOpen = () => setIsAiReferenceOpen(true)
  const handleAiReferenceClose = () => setIsAiReferenceOpen(false)

  const handlePrint = async () => {
    if (!quote || !products || !families) return
    setIsPrinting(true)
    await new Promise((resolve) => setTimeout(resolve, 0))
    try {
      await printQuote(
        quote,
        products,
        families,
        settings?.pdfDepartmentOrder ?? []
      )
    } finally {
      setIsPrinting(false)
    }
  }

  const quote = getSelectedQuote(quotes || [], year, month, day) ?? null
  const numberOfSuppliers = getNumberOfSuppliers(ordersByQuoteId || [])

  const quoteRows =
    quote && suppliers
      ? getQuoteRows(
          quote,
          ordersByQuoteId || [],
          suppliers,
          products || [],
          families || []
        )
      : []

  useEffect(() => {
    setQuoteId(quote?.id ?? null)
  }, [quote, setQuoteId])

  const nextQuoteDate = quote ? getNextQuoteDate(quotes ?? [], quote) : null

  useEffect(() => {
    if (!quote) return
    const range = getQuoteInvoiceDateRange(quote, nextQuoteDate)
    if (
      range.startDate === invoiceDateRange.startDate &&
      range.endDate === invoiceDateRange.endDate
    ) {
      return
    }
    setInvoiceDateRange(range)
  }, [quote, nextQuoteDate, invoiceDateRange, setInvoiceDateRange])

  const pendingInvoices =
    quote && invoices
      ? getPendingInvoicesForQuote(invoices, quote, nextQuoteDate)
      : []

  const onYearChange = (year: number) => setYear(year)
  const onMonthChange = (month: number) => setMonth(month)
  const onDayChange = (day: number) => setDay(day)

  const isFetching = quotes === null
  const hasQuoteRows = !!quoteRows.length

  const filteredRows = quoteRows.filter((row) =>
    matchesSearch(search, row.description)
  )

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
    handlePrint,
    isPrinting,
    numberOfSuppliers,
    pendingInvoices,
    handleSuccess,
    quoteToDelete,
    handleDeleteQuote,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
