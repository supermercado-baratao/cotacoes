import { useState } from 'react'

import type { TImportData } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { parseXlsx } from './utils'

export const useImportHandler = () => {
  const { importData: runImport } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [file, setFile] = useState<File | null>(null)
  const [importData, setImportData] = useState<TImportData | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleFileSelect = async (selected: File) => {
    setFile(selected)
    const data = await parseXlsx(selected)
    setImportData(data)
    setSelectedIds(data.products.map((p) => p.vrId))
  }

  const handleFileRemove = () => {
    setFile(null)
    setImportData(null)
    setSelectedIds([])
  }

  const handleImportClick = () => {
    if (!importData) return

    const selectedProducts = importData.products.filter((p) =>
      selectedIds.includes(p.vrId)
    )
    const selectedFamilyIds = new Set(
      selectedProducts.map((p) => p.familyId).filter(Boolean)
    )
    const selectedSupplierIds = new Set(
      selectedProducts.flatMap((p) => p.supplierIds)
    )

    setSuccessCallbacks([handleFileRemove])
    runImport({
      products: selectedProducts,
      families: importData.families.filter((f) =>
        selectedFamilyIds.has(f.vrId)
      ),
      suppliers: importData.suppliers.filter((s) =>
        selectedSupplierIds.has(s.vrId)
      )
    })
  }

  return {
    file,
    handleFileSelect,
    handleFileRemove,
    importData,
    selectedIds,
    setSelectedIds,
    handleImportClick
  }
}
