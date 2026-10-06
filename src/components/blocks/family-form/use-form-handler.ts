import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TFamily } from '@/models/family-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  family: TFamily | null,
  setFormFamily: (family: TFamily | null) => void,
  handleClose: () => void
) => {
  const { createFamily, updateFamily } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      id: family?.id ?? '',
      description: family?.description ?? ''
    }),
    [family]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit((data) => {
    setSuccessCallbacks([handleClose, () => setFormFamily(null)])
    if (family) {
      updateFamily({ ...family, ...data, id: family.id })
      return
    }
    createFamily(data)
  })

  return { register, onSubmit, errors }
}
