import { useMemo, useState } from 'react'

import type { TFamily } from '@/models'
import { useAppStore } from '@/stores'

import { filterFamilies } from './utils'

export const useFamiliesHandler = () => {
  const { families, deleteFamily } = useAppStore()

  const [formFamily, setFormFamily] = useState<TFamily | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [familyToDelete, setFamilyToDelete] = useState<TFamily | null>(null)
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

  const handleDeleteDialogOpen = (family: TFamily) => {
    setFamilyToDelete(family)
  }

  const handleDeleteDialogClose = () => {
    setFamilyToDelete(null)
  }

  const handleDeleteDialogConfirm = () => {
    if (familyToDelete) {
      deleteFamily(familyToDelete.id)
      handleDeleteDialogClose()
    }
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
    handleDeleteDialogOpen,
    handleFormClose,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    isFormOpen,
    formFamily,
    setFormFamily,
    familyToDelete
  }
}
