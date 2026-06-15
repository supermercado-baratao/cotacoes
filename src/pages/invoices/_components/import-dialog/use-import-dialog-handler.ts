import { useState } from 'react'

import type { TInvoiceOrigin } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { parseNfe, type TParsedNfe } from './parse-nfe'

export const useImportDialogHandler = (handleClose: () => void) => {
  const { products, suppliers, createInvoice } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [origin, setOrigin] = useState<TInvoiceOrigin>('issued')
  const [parsedNfe, setParsedNfe] = useState<TParsedNfe | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setParseError(null)
    setParsedNfe(null)
    try {
      const xml = await file.text()
      const result = parseNfe(xml, products ?? [], suppliers ?? [])
      setParsedNfe(result)
    } catch (e) {
      setParseError((e as Error).message)
    }
  }

  const handleReset = () => {
    setParsedNfe(null)
    setParseError(null)
  }

  const handleImport = () => {
    if (!parsedNfe) return
    setSuccessCallbacks([handleClose, handleReset])
    createInvoice({ ...parsedNfe, origin })
  }

  return {
    origin,
    setOrigin,
    parsedNfe,
    parseError,
    handleFileSelect,
    handleReset,
    handleImport
  }
}
