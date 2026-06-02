import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TGroup } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  group: TGroup | null,
  setFormGroup: (group: TGroup | null) => void,
  handleClose: () => void
) => {
  const { createGroup, updateGroup } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({ description: group?.description ?? '' }),
    [group]
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
    setSuccessCallbacks([handleClose, () => setFormGroup(null)])
    if (group) {
      updateGroup({ ...group, ...data })
      return
    }
    createGroup(data)
  })

  return { register, onSubmit, errors }
}
