import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TGroup } from '@/models'
import { useAppStore } from '@/stores'

import { filterGroups } from './utils'

export const useGroupsHandler = () => {
  const { groups } = useAppStore()
  const {
    formItem: formGroup,
    setFormItem: setFormGroup,
    isFormOpen,
    handleFormOpen,
    handleFormClose
  } = useFormState<TGroup>()

  const [search, setSearch] = useState('')

  const filteredGroups = useMemo(
    () => (groups ? filterGroups(search, groups) : null),
    [search, groups]
  )

  const isFetching = groups === null

  const hasGroups = !!groups?.length

  return {
    isFetching,
    hasGroups,
    search,
    setSearch,
    handleFormOpen,
    filteredGroups,
    handleFormClose,
    isFormOpen,
    formGroup,
    setFormGroup
  }
}
