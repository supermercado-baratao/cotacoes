import { useEffect, useMemo, useState } from 'react'

import { suggestPriceReferences, type TAiSuggestion } from '@/infra'
import type { TQuote, TQuoteItem } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { ANALYSIS_MESSAGE_INTERVAL_MS, ANALYSIS_MESSAGES } from './constants'
import {
  buildRows,
  getCachedItemIds,
  isAlreadyReferenced,
  loadFromCache,
  saveToCache,
  type TSuggestionRow
} from './utils'

export const useAiReference = (
  quote: TQuote,
  isOpened: boolean,
  onClose: () => void
) => {
  const { products, families, updateQuote } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [rows, setRows] = useState<TSuggestionRow[]>([])
  const [uncachedItems, setUncachedItems] = useState<TQuoteItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [shouldAnalyze, setShouldAnalyze] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<TQuoteItem | null>(null)
  const [editingSuggestion, setEditingSuggestion] =
    useState<TAiSuggestion | null>(null)

  const unreferencedItems = useMemo(
    () => quote.items.filter((i) => i.priceRef === null),
    [quote.items]
  )

  useEffect(() => {
    if (!isOpened || !products || !families) return

    const run = async () => {
      const cached = loadFromCache(quote.id)
      const cachedSet = new Set(getCachedItemIds(quote.id))
      setUncachedItems(unreferencedItems.filter((i) => !cachedSet.has(i.id)))
      setRows(
        buildRows({
          items: unreferencedItems,
          suggestions: cached ?? [],
          products,
          families
        })
      )
    }

    void run()
  }, [isOpened, products, families, unreferencedItems, quote.id])

  useEffect(() => {
    if (isOpened) return

    const run = async () => {
      setShouldAnalyze(false)
      setError(null)
    }

    void run()
  }, [isOpened])

  useEffect(() => {
    if (!shouldAnalyze || !uncachedItems.length || !products || !families)
      return

    let cancelled = false
    let msgInterval: ReturnType<typeof setInterval> | null = null
    let elapsedInterval: ReturnType<typeof setInterval> | null = null
    const itemIds = uncachedItems.map((i) => i.id)

    const run = async () => {
      if (!cancelled) {
        setShouldAnalyze(false)
        setIsAnalyzing(true)
        setElapsedSeconds(0)
        setError(null)
        setStatusMessage(ANALYSIS_MESSAGES[0])
      }

      let msgIndex = 0
      msgInterval = setInterval(() => {
        if (!cancelled) {
          msgIndex = Math.min(msgIndex + 1, ANALYSIS_MESSAGES.length - 1)
          setStatusMessage(ANALYSIS_MESSAGES[msgIndex])
        }
      }, ANALYSIS_MESSAGE_INTERVAL_MS)

      let elapsed = 0
      elapsedInterval = setInterval(() => {
        if (!cancelled) setElapsedSeconds(++elapsed)
      }, 1000)

      try {
        const suggestions = await suggestPriceReferences(
          uncachedItems,
          products,
          families
        )
        if (!cancelled) {
          saveToCache(quote.id, itemIds, suggestions)
          const allCached = loadFromCache(quote.id) ?? []
          setRows(
            buildRows({
              items: unreferencedItems,
              suggestions: allCached,
              products,
              families
            })
          )
          setUncachedItems([])
        }
      } catch {
        if (!cancelled)
          setError(
            'Erro ao consultar a IA. Verifique as credenciais e tente novamente.'
          )
      } finally {
        if (msgInterval) clearInterval(msgInterval)
        if (elapsedInterval) clearInterval(elapsedInterval)
        if (!cancelled) {
          setIsAnalyzing(false)
          setStatusMessage(null)
          setElapsedSeconds(0)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
      if (msgInterval) clearInterval(msgInterval)
      if (elapsedInterval) clearInterval(elapsedInterval)
    }
  }, [
    shouldAnalyze,
    uncachedItems,
    products,
    families,
    quote.id,
    unreferencedItems
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
      return {
        ...item,
        priceRef: { type: row.suggestion.type, id: row.suggestion.id }
      }
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

  return {
    rows,
    uncachedItems,
    isAnalyzing,
    statusMessage,
    elapsedSeconds,
    error,
    acceptedCount,
    editingItem,
    editingSuggestion,
    handleEdit,
    handleAnalyze: () => setShouldAnalyze(true),
    toggleAccepted,
    handleApply,
    handleClose,
    handleEditClose
  }
}
