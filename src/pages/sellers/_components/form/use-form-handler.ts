import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TSeller } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  seller: TSeller | null,
  setFormSeller: (seller: TSeller | null) => void,
  handleClose: () => void
) => {
  const { createSeller, updateSeller, suppliers } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      name: seller?.name ?? '',
      phone: seller?.phone ?? null,
      supplierIds: seller?.supplierIds ?? []
    }),
    [seller]
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit((data) => {
    if (seller) {
      setSuccessCallbacks([handleClose, () => setFormSeller(null)])
      updateSeller({ ...seller, ...data })
      return
    }
    setSuccessCallbacks([handleClose, () => reset(defaultValues)])
    createSeller(data)
  })

  return { control, register, onSubmit, errors, suppliers: suppliers ?? [] }
}
