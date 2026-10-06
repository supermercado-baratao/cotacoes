import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks/use-form-state'
import type { TFamily } from '@/models/family-model/types'
import { useAppStore } from '@/stores/use-app-store'

import { filterFamilies } from './utils'

export const useFamiliesHandler = () => {
  const { families } = useAppStore()
  const {
    formItem: formFamily,
    setFormItem: setFormFamily,
    isFormOpen,
    handleFormOpen,
    handleFormClose
  } = useFormState<TFamily>()

  const [search, setSearch] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)

  const filteredFamilies = useMemo(
    () => (families ? filterFamilies(search, families) : null),
    [search, families]
  )

  const isFetching = families === null
  const hasFamilies = !!families?.length

  return {
    isFetching,
    hasFamilies,
    search,
    setSearch,
    handleFormOpen,
    filteredFamilies,
    handleFormClose,
    isFormOpen,
    formFamily,
    setFormFamily,
    isImportOpen,
    handleImportOpen: () => setIsImportOpen(true),
    handleImportClose: () => setIsImportOpen(false)
  }
}
