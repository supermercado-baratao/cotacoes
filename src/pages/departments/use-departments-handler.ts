import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks/use-form-state'
import type { TDepartment } from '@/models/department-model/types'
import { useAppStore } from '@/stores/use-app-store'

import { filterDepartments } from './utils'

export const useDepartmentsHandler = () => {
  const { departments } = useAppStore()
  const {
    formItem: formDepartment,
    setFormItem: setFormDepartment,
    isFormOpen,
    handleFormOpen,
    handleFormClose
  } = useFormState<TDepartment>()

  const [search, setSearch] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)

  const filteredDepartments = useMemo(
    () => (departments ? filterDepartments(search, departments) : null),
    [search, departments]
  )

  const isFetching = departments === null
  const hasDepartments = !!departments?.length

  return {
    isFetching,
    hasDepartments,
    search,
    setSearch,
    handleFormOpen,
    filteredDepartments,
    handleFormClose,
    isFormOpen,
    formDepartment,
    setFormDepartment,
    isImportOpen,
    handleImportOpen: () => setIsImportOpen(true),
    handleImportClose: () => setIsImportOpen(false)
  }
}
