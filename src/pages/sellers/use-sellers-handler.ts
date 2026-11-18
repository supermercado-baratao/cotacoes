import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks/use-form-state'
import type { TSeller } from '@/models/seller/types'
import { useAppStore } from '@/stores/use-app-store'

import { filterSellers } from './utils'

export const useSellersHandler = () => {
  const { sellers } = useAppStore()
  const {
    formItem: formSeller,
    setFormItem: setFormSeller,
    isFormOpen,
    handleFormOpen,
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
    handleFormClose,
    isFormOpen,
    formSeller,
    setFormSeller,
    quickCreateSupplier,
    setQuickCreateSupplier
  }
}
