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

  const handleOpenCreate = () => {
    setFormFamily(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (family: TFamily) => {
    setFormFamily(family)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleOpenDelete = (family: TFamily) => {
    setFamilyToDelete(family)
  }

  const handleCloseDelete = () => {
    setFamilyToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (familyToDelete) {
      deleteFamily(familyToDelete.id)
      handleCloseDelete()
    }
  }

  const isFetching = families === null
  const hasFamilies = !!families?.length

  return {
    isFetching,
    hasFamilies,
    search,
    setSearch,
    handleOpenCreate,
    filteredFamilies,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
    isFormOpen,
    formFamily,
    setFormFamily,
    familyToDelete
  }
}
