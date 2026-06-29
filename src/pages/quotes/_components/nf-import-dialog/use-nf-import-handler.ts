import { useMemo, useState } from 'react'

import type { TOrder, TQuote } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'
import { parseNfe, type TParsedNfe } from '@/utils'

import { matchNfesToOrders, type TMatchResult } from './match-nfe'

type TParseError = { filename: string; message: string }

export const useNfImportHandler = (quote: TQuote, handleClose: () => void) => {
  const { products, suppliers, quotes, importNfsWithOrders } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [parsedNfes, setParsedNfes] = useState<TParsedNfe[]>([])
  const [parseErrors, setParseErrors] = useState<TParseError[]>([])
  const [isUnmatchedOpen, setIsUnmatchedOpen] = useState(false)

  const handleReset = () => {
    setParsedNfes([])
    setParseErrors([])
    setIsUnmatchedOpen(false)
  }

  const handleFilesChange = async (files: FileList) => {
    const newNfes: TParsedNfe[] = []
    const newErrors: TParseError[] = []

    for (const file of Array.from(files)) {
      try {
        const xml = await file.text()
        const result = parseNfe(xml, products ?? [], suppliers ?? [])
        newNfes.push(result)
      } catch (e) {
        newErrors.push({ filename: file.name, message: (e as Error).message })
      }
    }

    setParsedNfes((prev) => {
      const existingKeys = new Set(prev.map((n) => n.accessKey))
      return [...prev, ...newNfes.filter((n) => !existingKeys.has(n.accessKey))]
    })
    setParseErrors((prev) => [...prev, ...newErrors])
  }

  const handleRemoveNfe = (accessKey: string) => {
    setParsedNfes((prev) => prev.filter((n) => n.accessKey !== accessKey))
  }

  const handleRemoveError = (index: number) => {
    setParseErrors((prev) => prev.filter((_, i) => i !== index))
  }

  const nextQuoteDate = useMemo((): string | null => {
    if (!quotes) return null
    const sorted = [...quotes].sort((a, b) => a.date.localeCompare(b.date))
    const idx = sorted.findIndex((q) => q.id === quote.id)
    return sorted[idx + 1]?.date ?? null
  }, [quotes, quote.id])

  const matchResult = useMemo((): TMatchResult | null => {
    if (!parsedNfes.length || !products) return null
    return matchNfesToOrders(parsedNfes, quote, products, nextQuoteDate)
  }, [parsedNfes, quote, products, nextQuoteDate])

  const nfeStats = useMemo(() => {
    const map = new Map<string, { matched: number; total: number }>()
    for (const nfe of parsedNfes) {
      const matched =
        matchResult?.matched.filter((m) => m.nfAccessKey === nfe.accessKey)
          .length ?? 0
      map.set(nfe.accessKey, { matched, total: nfe.items.length })
    }
    return map
  }, [matchResult, parsedNfes])

  const handleImport = () => {
    if (!matchResult?.matched.length) return
    const orders: TCreateData<TOrder>[] = matchResult.matched.map(
      ({
        quoteId,
        quoteItemId,
        productId,
        supplierId,
        sellerId,
        invoiceId,
        date,
        price,
        quantity,
        packing,
        observations
      }) => ({
        quoteId,
        quoteItemId,
        productId,
        supplierId,
        sellerId,
        invoiceId,
        date,
        price,
        quantity,
        packing,
        observations
      })
    )
    setSuccessCallbacks([handleClose, handleReset])
    importNfsWithOrders({ nfes: parsedNfes, quoteId: quote.id, orders })
  }

  return {
    parsedNfes,
    parseErrors,
    matchResult,
    nfeStats,
    isUnmatchedOpen,
    setIsUnmatchedOpen,
    handleFilesChange,
    handleRemoveNfe,
    handleRemoveError,
    handleReset,
    handleImport
  }
}
