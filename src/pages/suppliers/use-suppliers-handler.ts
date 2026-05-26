import { useMemo, useState } from 'react'

import { useFormState } from '@/hooks'
import type { TSupplier } from '@/models'
import { useAppStore } from '@/stores'

import { filterSuppliers } from './utils'

export const useSuppliersHandler = () => {
  const { suppliers } = useAppStore()
  const {
    formItem: formSupplier,
    setFormItem: setFormSupplier,
    isFormOpen,
    handleFormOpen,
    handleFormEdit,
    handleFormClose
  } = useFormState<TSupplier>()

  const [search, setSearch] = useState('')
  const [quickCreateSeller, setQuickCreateSeller] = useState(false)

  const filteredSuppliers = useMemo(
    () => (suppliers ? filterSuppliers(search, suppliers) : null),
    [search, suppliers]
  )

  const isFetching = suppliers === null
  const hasSuppliers = !!suppliers?.length

  return {
    isFetching,
    hasSuppliers,
    search,
    setSearch,
    handleFormOpen,
    filteredSuppliers,
    handleFormEdit,
    handleFormClose,
    isFormOpen,
    formSupplier,
    setFormSupplier,
    quickCreateSeller,
    setQuickCreateSeller
  }
}
