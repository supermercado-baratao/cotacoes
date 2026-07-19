import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TSupplier } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  supplier: TSupplier | null,
  setFormSupplier: (supplier: TSupplier | null) => void,
  handleClose: () => void,
  onCreated?: (supplier: TSupplier) => void
) => {
  const { createSupplier, updateSupplier } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      id: supplier?.id ?? '',
      legalName: supplier?.legalName ?? '',
      tradeName: supplier?.tradeName ?? '',
      cnpj: supplier?.cnpj ?? '',
      email: supplier?.email ?? null,
      phone: supplier?.phone ?? null,
      observations: supplier?.observations ?? null
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
      updateSupplier({
        ...supplier,
        ...data,
        id: supplier.id,
        vrCreatedAt: supplier.vrCreatedAt
      })
      return
    }
    createSupplier(
      { ...data, vrCreatedAt: null },
      onCreated ? { onSuccess: onCreated } : undefined
    )
  })

  return { register, onSubmit, errors, control }
}
