import { useState } from 'react'

import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { normalizeCnpj } from '@/utils/formatters'
import { hasMissingFiscalData } from '@/utils/invoice-fiscal-data'
import { findSupplierByCnpj, isSupplierCnpjIgnored } from '@/utils/suppliers'

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

    // FileList is live: the input is cleared right after this starts, so
    // iterating it across awaits would only see the first file.
    const selectedFiles = [...files]
    for (const file of selectedFiles) {
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
      } catch (error) {
        newErrors.push({
          filename: file.name,
          message: (error as Error).message
        })
      }
    }

    setParsedNfes((previous) => {
      const existingKeys = new Set(previous.map((n) => n.accessKey))
      return [
        ...previous,
        ...newNfes.filter((n) => !existingKeys.has(n.accessKey))
      ]
    })
    setDuplicateNfes((previous) => {
      const existingKeys = new Set(previous.map((n) => n.accessKey))
      return [
        ...previous,
        ...newDuplicates.filter((n) => !existingKeys.has(n.accessKey))
      ]
    })
    setCompletableNfes((previous) => {
      const existingKeys = new Set(previous.map((n) => n.accessKey))
      return [
        ...previous,
        ...newCompletables.filter((n) => !existingKeys.has(n.accessKey))
      ]
    })
    setIgnoredNfes((previous) => {
      const existingKeys = new Set(previous.map((n) => n.accessKey))
      return [
        ...previous,
        ...newIgnored.filter((n) => !existingKeys.has(n.accessKey))
      ]
    })
    setParseErrors((previous) => [...previous, ...newErrors])
  }

  const handleRemoveNfe = (accessKey: string) => {
    setParsedNfes((previous) =>
      previous.filter((nfe) => nfe.accessKey !== accessKey)
    )
  }

  const handleRemoveDuplicate = (accessKey: string) => {
    setDuplicateNfes((previous) =>
      previous.filter((nfe) => nfe.accessKey !== accessKey)
    )
  }

  const handleRemoveCompletable = (accessKey: string) => {
    setCompletableNfes((previous) =>
      previous.filter((nfe) => nfe.accessKey !== accessKey)
    )
  }

  const handleRemoveIgnored = (accessKey: string) => {
    setIgnoredNfes((previous) =>
      previous.filter((nfe) => nfe.accessKey !== accessKey)
    )
  }

  const handleRemoveError = (index: number) => {
    setParseErrors((previous) =>
      previous.filter((_, errorIndex) => errorIndex !== index)
    )
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
    setParsedNfes((previous) =>
      previous.filter(
        (n) => normalizeCnpj(n.supplierCnpj) !== normalizeCnpj(nfe.supplierCnpj)
      )
    )
    setIgnoredNfes((previous) => [...previous, ...movedNfes])
  }

  const handleImport = () => {
    if (parsedNfes.length === 0 && completableNfes.length === 0) return
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
