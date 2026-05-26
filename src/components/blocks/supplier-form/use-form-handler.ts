import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TSupplier } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  supplier: TSupplier | null,
  setFormSupplier: (supplier: TSupplier | null) => void,
  handleClose: () => void
) => {
  const { createSupplier, updateSupplier, sellers } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      legalName: supplier?.legalName ?? '',
      tradeName: supplier?.tradeName ?? '',
      cnpj: supplier?.cnpj ?? '',
      email: supplier?.email ?? null,
      phone: supplier?.phone ?? null,
      sellerIds: supplier?.sellerIds ?? []
    }),
    [supplier]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit((data) => {
    setSuccessCallbacks([handleClose, () => setFormSupplier(null)])
    if (supplier) {
      updateSupplier({ ...supplier, ...data })
      return
    }
    createSupplier(data)
  })

  return {
    register,
    onSubmit,
    errors,
    control,
    sellers: sellers ?? []
  }
}
