import { useMemo, useState } from 'react'

import { DEFAULT_MARGIN_TOLERANCE } from '@/constants'
import type { TMarginTolerance } from '@/models'
import { useAppStore } from '@/stores'

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
      Array.from(
        new Set((products ?? []).map((product) => product.department))
      ).filter(Boolean),
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

  if (orderedDepartments !== syncedOrderedDepartments) {
    setSyncedOrderedDepartments(orderedDepartments)
    setOrder(orderedDepartments)
  }

  const derivedMarginTolerance = useMemo(
    () => settings?.marginTolerance ?? DEFAULT_MARGIN_TOLERANCE,
    [settings]
  )
  const [marginTolerance, setMarginTolerance] = useState(derivedMarginTolerance)
  const [syncedMarginTolerance, setSyncedMarginTolerance] = useState(
    derivedMarginTolerance
  )

  if (derivedMarginTolerance !== syncedMarginTolerance) {
    setSyncedMarginTolerance(derivedMarginTolerance)
    setMarginTolerance(derivedMarginTolerance)
  }

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

  if (derivedDepartmentOverrides !== syncedDepartmentOverrides) {
    setSyncedDepartmentOverrides(derivedDepartmentOverrides)
    setDepartmentOverrides(derivedDepartmentOverrides)
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= order.length) return
    handleReorder(index, targetIndex)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setOrder((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleMarginToleranceChange = (
    field: keyof TMarginTolerance,
    value: number
  ) => setMarginTolerance((prev) => ({ ...prev, [field]: value }))

  const handleDepartmentOverrideAdd = (departmentId: string) =>
    setDepartmentOverrides((prev) => [
      ...prev,
      { departmentId, tolerance: marginTolerance }
    ])

  const handleDepartmentOverrideChange = (
    departmentId: string,
    field: keyof TMarginTolerance,
    value: number
  ) =>
    setDepartmentOverrides((prev) =>
      prev.map((row) =>
        row.departmentId === departmentId
          ? { ...row, tolerance: { ...row.tolerance, [field]: value } }
          : row
      )
    )

  const handleDepartmentOverrideRemove = (departmentId: string) =>
    setDepartmentOverrides((prev) =>
      prev.filter((row) => row.departmentId !== departmentId)
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

  const availableDepartments = (departments ?? []).filter(
    (department) =>
      !departmentOverrides.some((row) => row.departmentId === department.id)
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
