import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TSeller } from '@/models'
import { useAppStore } from '@/stores'

import { filterSellers } from './utils'

export const useSellersHandler = () => {
  const { sellers } = useAppStore()
  const {
    formItem: formSeller,
    setFormItem: setFormSeller,
    isFormOpen,
    handleFormOpen,
    handleFormEdit,
    handleFormClose
  } = useFormState<TSeller>()

  const [search, setSearch] = useState('')
  const [quickCreateSupplier, setQuickCreateSupplier] = useState(false)

  const filteredSellers = useMemo(
    () => (sellers ? filterSellers(search, sellers) : null),
    [search, sellers]
  )

  const isFetching = sellers === null
  const hasSellers = !!sellers?.length

  return {
    isFetching,
    hasSellers,
    search,
    setSearch,
    handleFormOpen,
    filteredSellers,
    handleFormEdit,
    handleFormClose,
    isFormOpen,
    formSeller,
    setFormSeller,
    quickCreateSupplier,
    setQuickCreateSupplier
  }
}
