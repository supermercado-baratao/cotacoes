import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TFamily } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  family: TFamily | null,
  setFormFamily: (family: TFamily | null) => void,
  handleClose: () => void
) => {
  const { createFamily, updateFamily, products } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      description: family?.description ?? '',
      productIds: family?.productIds ?? []
    }),
    [family]
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
    setSuccessCallbacks([handleClose, () => setFormFamily(null)])
    if (family) {
      updateFamily({ ...family, ...data })
      return
    }
    createFamily(data)
  })

  return { register, onSubmit, errors, control, products: products ?? [] }
}
