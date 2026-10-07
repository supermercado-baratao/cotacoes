import { zodResolver } from '@hookform/resolvers/zod'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'
import { useForm } from 'react-hook-form'

import { auth } from '@/infra/firebase-config'
import { useAlertStore } from '@/stores/use-alert-store'

import { SIGNUP_ERRORS } from './errors'
import { schema, type TSchema } from './schema'

export const useFormHandler = () => {
  const alert = useAlertStore((state) => state.alert)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )
      await Promise.all([
        updateProfile(firebaseUser, { displayName: data.name }),
        sendEmailVerification(firebaseUser)
      ])
    } catch (error: unknown) {
      const code = (error as { code?: string }).code ?? ''
      alert({
        title: 'Erro ao criar conta',
        description: SIGNUP_ERRORS[code] ?? 'Tente novamente',
        severity: 'error'
      })
    }
  })

  return { register, onSubmit, errors, isSubmitting }
}
