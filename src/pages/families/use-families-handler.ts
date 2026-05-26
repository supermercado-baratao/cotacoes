import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TFamily } from '@/models'
import { useAppStore } from '@/stores'

import { filterFamilies } from './utils'

export const useFamiliesHandler = () => {
  const { families } = useAppStore()
  const {
    formItem: formFamily,
    setFormItem: setFormFamily,
    isFormOpen,
    handleFormOpen,
    handleFormEdit,
    handleFormClose
  } = useFormState<TFamily>()

  const [search, setSearch] = useState('')

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
    handleFormEdit,
    handleFormClose,
    isFormOpen,
    formFamily,
    setFormFamily
  }
}
