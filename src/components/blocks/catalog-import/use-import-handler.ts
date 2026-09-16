import { useState } from 'react'

import type { TImportData } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import {
  getData,
  getProductImportStatus,
  type TProductImportStatus
} from './utils'

export const useImportHandler = () => {
  const { importData: runImport, products, departments } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const [file, setFile] = useState<File | null>(null)
  const [importData, setImportData] = useState<TImportData | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [productStatuses, setProductStatuses] = useState<
    Map<string, TProductImportStatus>
  >(new Map())

  const handleFileSelect = async (selected: File) => {
    setFile(selected)
    const data = await getData(selected, departments ?? [])
    setImportData(data)

    const existingById = new Map((products ?? []).map((p) => [p.id, p]))
    const statuses = new Map(
      data.products.map((p) => [p.id, getProductImportStatus(p, existingById)])
    )
    setProductStatuses(statuses)
    setSelectedIds(
      data.products
        .filter((p) => statuses.get(p.id) !== 'unchanged')
        .map((p) => p.id)
    )
  }

  const handleFileRemove = () => {
    setFile(null)
    setImportData(null)
    setSelectedIds([])
    setProductStatuses(new Map())
  }

  const handleImportClick = () => {
    if (!importData) return

    const selectedProducts = importData.products.filter((p) =>
      selectedIds.includes(p.id)
    )
    const selectedFamilyIds = new Set(
      selectedProducts.map((p) => p.familyId).filter(Boolean)
    )
    const selectedDepartmentIds = new Set(
      selectedProducts.map((p) => p.departmentId).filter(Boolean)
    )
    setSuccessCallbacks([handleFileRemove])
    runImport({
      products: selectedProducts,
      families: importData.families.filter((f) => selectedFamilyIds.has(f.id)),
      departments: importData.departments.filter((d) =>
        selectedDepartmentIds.has(d.id)
      ),
      suppliers: importData.suppliers
    })
  }

  return {
    file,
    handleFileSelect,
    handleFileRemove,
    importData,
    selectedIds,
    setSelectedIds,
    productStatuses,
    handleImportClick
  }
}
