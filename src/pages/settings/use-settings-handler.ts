import { useMemo, useState } from 'react'

import { useAppStore } from '@/stores'

import { buildDepartmentOrder } from './utils'

export const useSettingsHandler = () => {
  const { products, settings, updateSettings } = useAppStore()

  const departments = useMemo(
    () =>
      Array.from(
        new Set((products ?? []).map((product) => product.department))
      ).filter(Boolean),
    [products]
  )

  const orderedDepartments = useMemo(
    () => buildDepartmentOrder(departments, settings?.pdfDepartmentOrder ?? []),
    [departments, settings]
  )

  const [order, setOrder] = useState(orderedDepartments)
  const [syncedOrderedDepartments, setSyncedOrderedDepartments] =
    useState(orderedDepartments)

  if (orderedDepartments !== syncedOrderedDepartments) {
    setSyncedOrderedDepartments(orderedDepartments)
    setOrder(orderedDepartments)
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

  const handleSave = () => {
    updateSettings({ pdfDepartmentOrder: order })
  }

  const isFetching = products === null
  const isDirty = order.join('|') !== orderedDepartments.join('|')

  return {
    isFetching,
    order,
    handleMove,
    handleReorder,
    handleSave,
    isDirty
  }
}
