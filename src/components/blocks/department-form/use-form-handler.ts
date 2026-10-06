import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TDepartment } from '@/models/department-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  department: TDepartment | null,
  setFormDepartment: (department: TDepartment | null) => void,
  handleClose: () => void
) => {
  const { createDepartment, updateDepartment } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      description: department?.description ?? ''
    }),
    [department]
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
    setSuccessCallbacks([handleClose, () => setFormDepartment(null)])
    if (department) {
      updateDepartment({ ...department, ...data, id: department.id })
      return
    }
    createDepartment(data)
  })

  return { register, onSubmit, errors }
}
