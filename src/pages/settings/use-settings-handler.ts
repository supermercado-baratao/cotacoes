import { useMemo, useState } from 'react'

import { DEFAULT_MARGIN_TOLERANCE } from '@/constants/margin'
import type { TMarginTolerance } from '@/models/settings/types'
import { useAppStore } from '@/stores/use-app-store'

import {
  buildDepartmentOrder,
  fromDepartmentOverrideRows,
  serializeDepartmentOverrideRows,
  type TDepartmentMarginOverrideRow,
  toDepartmentOverrideRows
} from './utils'

export const useSettingsHandler = () => {
  const { products, departments, settings, updateSettings } = useAppStore()

  const productDepartments = useMemo(
    () =>
      [
        ...new Set((products ?? []).map((product) => product.department))
      ].filter(Boolean),
    [products]
  )

  const orderedDepartments = useMemo(
    () =>
      buildDepartmentOrder(
        productDepartments,
        settings?.pdfDepartmentOrder ?? []
      ),
    [productDepartments, settings]
  )

  const [order, setOrder] = useState(orderedDepartments)
  const [syncedOrderedDepartments, setSyncedOrderedDepartments] =
    useState(orderedDepartments)

  const derivedMarginTolerance = useMemo(
    () => settings?.marginTolerance ?? DEFAULT_MARGIN_TOLERANCE,
    [settings]
  )
  const [marginTolerance, setMarginTolerance] = useState(derivedMarginTolerance)
  const [syncedMarginTolerance, setSyncedMarginTolerance] = useState(
    derivedMarginTolerance
  )

  const derivedDepartmentOverrides = useMemo(
    () => toDepartmentOverrideRows(settings?.departmentMarginTolerances ?? {}),
    [settings]
  )
  const [departmentOverrides, setDepartmentOverrides] = useState(
    derivedDepartmentOverrides
  )
  const [syncedDepartmentOverrides, setSyncedDepartmentOverrides] = useState(
    derivedDepartmentOverrides
  )

  // Só resincroniza com o servidor quando o usuário não tem edições
  // pendentes — evita que um refetch em segundo plano (ex: import
  // concluindo) sobrescreva alterações ainda não salvas no formulário.
  const hasUnsavedChanges =
    order.join('|') !== syncedOrderedDepartments.join('|') ||
    marginTolerance.below !== syncedMarginTolerance.below ||
    marginTolerance.above !== syncedMarginTolerance.above ||
    serializeDepartmentOverrideRows(departmentOverrides) !==
      serializeDepartmentOverrideRows(syncedDepartmentOverrides)

  if (!hasUnsavedChanges && orderedDepartments !== syncedOrderedDepartments) {
    setSyncedOrderedDepartments(orderedDepartments)
    setOrder(orderedDepartments)
  }

  if (!hasUnsavedChanges && derivedMarginTolerance !== syncedMarginTolerance) {
    setSyncedMarginTolerance(derivedMarginTolerance)
    setMarginTolerance(derivedMarginTolerance)
  }

  if (
    !hasUnsavedChanges &&
    derivedDepartmentOverrides !== syncedDepartmentOverrides
  ) {
    setSyncedDepartmentOverrides(derivedDepartmentOverrides)
    setDepartmentOverrides(derivedDepartmentOverrides)
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= order.length) return
    handleReorder(index, targetIndex)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setOrder((previous) => {
      const next = [...previous]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleMarginToleranceChange = (
    field: keyof TMarginTolerance,
    value: number
  ) => setMarginTolerance((previous) => ({ ...previous, [field]: value }))

  const handleDepartmentOverrideAdd = (departmentId: string) =>
    setDepartmentOverrides((previous) => [
      ...previous,
      { departmentId, tolerance: marginTolerance }
    ])

  const handleDepartmentOverrideChange = (
    departmentId: string,
    field: keyof TMarginTolerance,
    value: number
  ) =>
    setDepartmentOverrides((previous) =>
      previous.map((row) =>
        row.departmentId === departmentId
          ? { ...row, tolerance: { ...row.tolerance, [field]: value } }
          : row
      )
    )

  const handleDepartmentOverrideRemove = (departmentId: string) =>
    setDepartmentOverrides((previous) =>
      previous.filter((row) => row.departmentId !== departmentId)
    )

  const handleSave = () => {
    updateSettings({
      pdfDepartmentOrder: order,
      marginTolerance,
      departmentMarginTolerances:
        fromDepartmentOverrideRows(departmentOverrides)
    })
  }

  const isFetching = products === null
  const isDirty =
    order.join('|') !== orderedDepartments.join('|') ||
    marginTolerance.below !== derivedMarginTolerance.below ||
    marginTolerance.above !== derivedMarginTolerance.above ||
    serializeDepartmentOverrideRows(departmentOverrides) !==
      serializeDepartmentOverrideRows(derivedDepartmentOverrides)

  const availableDepartments = (departments ?? []).filter((department) =>
    departmentOverrides.every((row) => row.departmentId !== department.id)
  )

  return {
    isFetching,
    order,
    handleMove,
    handleReorder,
    handleSave,
    isDirty,
    marginTolerance,
    handleMarginToleranceChange,
    departmentOverrides: departmentOverrides as TDepartmentMarginOverrideRow[],
    departments: departments ?? [],
    availableDepartments,
    handleDepartmentOverrideAdd,
    handleDepartmentOverrideChange,
    handleDepartmentOverrideRemove
  }
}
