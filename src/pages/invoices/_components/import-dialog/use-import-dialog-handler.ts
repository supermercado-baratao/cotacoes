import { useState } from 'react'

import { useAppStore, useCallbackStore } from '@/stores'
import { parseNfe, type TParsedNfe } from '@/utils'

type TParseError = { filename: string; message: string }

export const useImportDialogHandler = (handleClose: () => void) => {
  const { products, suppliers, createInvoicesBatch } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [parsedNfes, setParsedNfes] = useState<TParsedNfe[]>([])
  const [parseErrors, setParseErrors] = useState<TParseError[]>([])

  const handleReset = () => {
    setParsedNfes([])
    setParseErrors([])
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

  const handleImport = () => {
    if (!parsedNfes.length) return
    setSuccessCallbacks([handleClose, handleReset])
    createInvoicesBatch(parsedNfes)
  }

  return {
    parsedNfes,
    parseErrors,
    products: products ?? [],
    handleFilesChange,
    handleRemoveNfe,
    handleRemoveError,
    handleReset,
    handleImport
  }
}
