import { useMemo, useState } from 'react'

import type { TFamily } from '@/models'
import { useAppStore } from '@/stores'

import { filterFamilies } from './utils'

export const useFamiliesHandler = () => {
  const { families } = useAppStore()

  const [formFamily, setFormFamily] = useState<TFamily | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredFamilies = useMemo(
    () => (families ? filterFamilies(search, families) : null),
    [search, families]
  )

  const handleFormOpen = () => {
    setFormFamily(null)
    setIsFormOpen(true)
  }

  const handleFormEdit = (family: TFamily) => {
    setFormFamily(family)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
  }

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
