import { useEffect, useMemo, useRef, useState } from 'react'

import { suggestPriceReferences, type TAiSuggestion } from '@/infra'
import type { TQuote, TQuoteItem } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import {
  PROGRESS_MESSAGE_INTERVAL_MS,
  PROGRESS_MESSAGES,
  TIP_MESSAGE_INTERVAL_MS,
  TIP_MESSAGES
} from './constants'
import { buildRows, isAlreadyReferenced, type TSuggestionRow } from './utils'

export const useAiReference = (
  quote: TQuote,
  isOpened: boolean,
  onClose: () => void
) => {
  const { products, families, updateQuote, aiSuggestions, setAiSuggestions } =
    useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [rows, setRows] = useState<TSuggestionRow[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string>(
    PROGRESS_MESSAGES[0]
  )
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isAiUnavailable, setIsAiUnavailable] = useState(false)
  const [editingItem, setEditingItem] = useState<TQuoteItem | null>(null)
  const [editingSuggestion, setEditingSuggestion] =
    useState<TAiSuggestion | null>(null)
  const analysisStarted = useRef(false)

  const unreferencedItems = useMemo(
    () => quote.items.filter((i) => i.priceRef === null),
    [quote.items]
  )

  useEffect(() => {
    if (!isOpened) {
      analysisStarted.current = false
      void (async () => {
        setError(null)
        setIsAiUnavailable(false)
      })()
      return
    }
    if (!products || !families) return

    const stored = aiSuggestions[quote.id] ?? null
    if (stored) {
      void (async () => {
        setRows(
          buildRows({
            items: quote.items,
            suggestions: stored,
            products,
            families
          })
        )
      })()
      return
    }

    if (analysisStarted.current) return
    analysisStarted.current = true

    if (unreferencedItems.length === 0) {
      void (async () => {
        setAiSuggestions(quote.id, [])
        setRows(
          buildRows({ items: quote.items, suggestions: [], products, families })
        )
      })()
      return
    }

    let cancelled = false
    let msgTimeout: ReturnType<typeof setTimeout> | null = null
    let elapsedInterval: ReturnType<typeof setInterval> | null = null

    const run = async () => {
      setIsAnalyzing(true)
      setElapsedSeconds(0)
      setError(null)
      setIsAiUnavailable(false)
      setStatusMessage(PROGRESS_MESSAGES[0])

      let step = 1
      const scheduleNext = () => {
        if (cancelled) return
        const isProgress = step < PROGRESS_MESSAGES.length
        const msg = isProgress
          ? PROGRESS_MESSAGES[step]
          : TIP_MESSAGES[
              (step - PROGRESS_MESSAGES.length) % TIP_MESSAGES.length
            ]
        const delay = isProgress
          ? PROGRESS_MESSAGE_INTERVAL_MS
          : TIP_MESSAGE_INTERVAL_MS
        setStatusMessage(msg)
        step++
        msgTimeout = setTimeout(scheduleNext, delay)
      }
      msgTimeout = setTimeout(scheduleNext, PROGRESS_MESSAGE_INTERVAL_MS)

      let elapsed = 0
      elapsedInterval = setInterval(() => {
        if (!cancelled) setElapsedSeconds(++elapsed)
      }, 1000)

      try {
        const { suggestions, isFallback } = await suggestPriceReferences(
          unreferencedItems,
          products,
          families
        )
        if (!cancelled) {
          setIsAiUnavailable(isFallback)
          setAiSuggestions(quote.id, suggestions)
          setRows(
            buildRows({ items: quote.items, suggestions, products, families })
          )
        }
      } catch {
        if (!cancelled)
          setError('Erro inesperado ao gerar sugestões. Tente novamente.')
      } finally {
        if (msgTimeout) clearTimeout(msgTimeout)
        if (elapsedInterval) clearInterval(elapsedInterval)
        if (!cancelled) {
          setIsAnalyzing(false)
          setElapsedSeconds(0)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
      analysisStarted.current = false
      if (msgTimeout) clearTimeout(msgTimeout)
      if (elapsedInterval) clearInterval(elapsedInterval)
    }
  }, [
    isOpened,
    products,
    families,
    aiSuggestions,
    quote.id,
    quote.items,
    unreferencedItems,
    retryCount,
    setAiSuggestions
  ])

  const toggleAccepted = (itemId: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.item.id === itemId ? { ...r, accepted: !r.accepted } : r
      )
    )

  const handleEdit = (itemId: string) => {
    const row = rows.find((r) => r.item.id === itemId)
    setEditingItem(quote.items.find((i) => i.id === itemId) ?? null)
    setEditingSuggestion(row?.suggestion ?? null)
  }

  const acceptedCount = rows.filter(
    (r) =>
      r.accepted &&
      r.suggestion.type !== null &&
      !isAlreadyReferenced(r.item.id, quote)
  ).length

  const handleApply = () => {
    const updatedItems = quote.items.map((item) => {
      const row = rows.find((r) => r.item.id === item.id)
      if (
        !row ||
        !row.accepted ||
        !row.suggestion.type ||
        !row.suggestion.id ||
        item.priceRef !== null
      )
        return item
      const { type, id } = row.suggestion
      const salePrice =
        type === 'product'
          ? ((products ?? []).find((p) => p.id === id)?.price ?? null)
          : ((products ?? []).find((p) => p.familyId === id)?.price ?? null)
      return { ...item, salePrice, priceRef: { type, id } }
    })
    setSuccessCallbacks([handleClose])
    updateQuote({ ...quote, items: updatedItems })
  }

  const handleClose = () => {
    setEditingItem(null)
    setEditingSuggestion(null)
    onClose()
  }

  const handleEditClose = () => {
    setEditingItem(null)
    setEditingSuggestion(null)
  }

  const handleRetry = () => {
    setError(null)
    setRetryCount((c) => c + 1)
  }

  return {
    rows,
    isAnalyzing,
    statusMessage,
    elapsedSeconds,
    error,
    isAiUnavailable,
    acceptedCount,
    editingItem,
    editingSuggestion,
    handleEdit,
    handleRetry,
    toggleAccepted,
    handleApply,
    handleClose,
    handleEditClose
  }
}
