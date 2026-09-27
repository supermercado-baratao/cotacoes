import { useState } from 'react'

import { useAppStore, useCallbackStore } from '@/stores'
import {
  findSupplierByCnpj,
  hasMissingFiscalData,
  isSupplierCnpjIgnored,
  normalizeCnpj
} from '@/utils'

import { parseNfe, type TParsedNfe } from '../../utils'

type TParseError = { filename: string; message: string }

export const useImportDialogHandler = (handleClose: () => void) => {
  const {
    invoices,
    products,
    suppliers,
    ignoredSuppliers,
    packageBarcodeLinks,
    createInvoicesBatch,
    createIgnoredSupplier
  } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [parsedNfes, setParsedNfes] = useState<TParsedNfe[]>([])
  const [duplicateNfes, setDuplicateNfes] = useState<TParsedNfe[]>([])
  // Já importadas, mas gravadas antes dos dados fiscais atuais (CFOP, natureza
  // da operação, custo com impostos) — o reenvio do XML completa esses campos
  // sem mexer em vínculos nem na conferência.
  const [completableNfes, setCompletableNfes] = useState<TParsedNfe[]>([])
  const [ignoredNfes, setIgnoredNfes] = useState<TParsedNfe[]>([])
  const [parseErrors, setParseErrors] = useState<TParseError[]>([])

  const handleReset = () => {
    setParsedNfes([])
    setDuplicateNfes([])
    setCompletableNfes([])
    setIgnoredNfes([])
    setParseErrors([])
  }

  const handleFilesChange = async (files: FileList) => {
    const newNfes: TParsedNfe[] = []
    const newDuplicates: TParsedNfe[] = []
    const newCompletables: TParsedNfe[] = []
    const newIgnored: TParsedNfe[] = []
    const newErrors: TParseError[] = []
    const existingById = new Map((invoices ?? []).map((inv) => [inv.id, inv]))

    for (const file of Array.from(files)) {
      try {
        const xml = await file.text()
        const result = parseNfe(xml, products ?? [], packageBarcodeLinks ?? [])
        if (
          isSupplierCnpjIgnored(result.supplierCnpj, ignoredSuppliers ?? [])
        ) {
          newIgnored.push(result)
          continue
        }
        const existing = existingById.get(result.accessKey)
        if (existing) {
          if (hasMissingFiscalData(existing)) {
            newCompletables.push(result)
          } else {
            newDuplicates.push(result)
          }
          continue
        }
        newNfes.push(result)
      } catch (e) {
        newErrors.push({ filename: file.name, message: (e as Error).message })
      }
    }

    setParsedNfes((prev) => {
      const existingKeys = new Set(prev.map((n) => n.accessKey))
      return [...prev, ...newNfes.filter((n) => !existingKeys.has(n.accessKey))]
    })
    setDuplicateNfes((prev) => {
      const existingKeys = new Set(prev.map((n) => n.accessKey))
      return [
        ...prev,
        ...newDuplicates.filter((n) => !existingKeys.has(n.accessKey))
      ]
    })
    setCompletableNfes((prev) => {
      const existingKeys = new Set(prev.map((n) => n.accessKey))
      return [
        ...prev,
        ...newCompletables.filter((n) => !existingKeys.has(n.accessKey))
      ]
    })
    setIgnoredNfes((prev) => {
      const existingKeys = new Set(prev.map((n) => n.accessKey))
      return [
        ...prev,
        ...newIgnored.filter((n) => !existingKeys.has(n.accessKey))
      ]
    })
    setParseErrors((prev) => [...prev, ...newErrors])
  }

  const handleRemoveNfe = (accessKey: string) => {
    setParsedNfes((prev) => prev.filter((n) => n.accessKey !== accessKey))
  }

  const handleRemoveDuplicate = (accessKey: string) => {
    setDuplicateNfes((prev) => prev.filter((n) => n.accessKey !== accessKey))
  }

  const handleRemoveCompletable = (accessKey: string) => {
    setCompletableNfes((prev) => prev.filter((n) => n.accessKey !== accessKey))
  }

  const handleRemoveIgnored = (accessKey: string) => {
    setIgnoredNfes((prev) => prev.filter((n) => n.accessKey !== accessKey))
  }

  const handleRemoveError = (index: number) => {
    setParseErrors((prev) => prev.filter((_, i) => i !== index))
  }

  const handleIgnoreSupplier = (nfe: TParsedNfe) => {
    const name =
      findSupplierByCnpj(nfe.supplierCnpj, suppliers ?? [])?.tradeName ??
      nfe.supplierName
    createIgnoredSupplier({
      id: normalizeCnpj(nfe.supplierCnpj),
      cnpj: nfe.supplierCnpj,
      name
    })

    const movedNfes = parsedNfes.filter(
      (n) => normalizeCnpj(n.supplierCnpj) === normalizeCnpj(nfe.supplierCnpj)
    )
    setParsedNfes((prev) =>
      prev.filter(
        (n) => normalizeCnpj(n.supplierCnpj) !== normalizeCnpj(nfe.supplierCnpj)
      )
    )
    setIgnoredNfes((prev) => [...prev, ...movedNfes])
  }

  const handleImport = () => {
    if (!parsedNfes.length && !completableNfes.length) return
    setSuccessCallbacks([handleClose, handleReset])
    createInvoicesBatch([...parsedNfes, ...completableNfes])
  }

  return {
    parsedNfes,
    duplicateNfes,
    completableNfes,
    ignoredNfes,
    parseErrors,
    products: products ?? [],
    suppliers: suppliers ?? [],
    handleFilesChange,
    handleRemoveNfe,
    handleRemoveDuplicate,
    handleRemoveCompletable,
    handleRemoveIgnored,
    handleRemoveError,
    handleIgnoreSupplier,
    handleReset,
    handleImport
  }
}
