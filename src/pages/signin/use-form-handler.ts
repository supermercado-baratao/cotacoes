import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useForm } from 'react-hook-form'

import { auth } from '@/infra/firebase-config'
import { useAlertStore } from '@/stores/use-alert-store'

import { SIGNIN_ERRORS } from './errors'
import { schema, type TSchema } from './schema'

export const useFormHandler = () => {
  const alert = useAlertStore((state) => state.alert)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      alert({
        title: 'Erro ao fazer login',
        description: SIGNIN_ERRORS[code] ?? 'Tente novamente',
        severity: 'error'
      })
    }
  })

  return { register, onSubmit, errors, isSubmitting }
}
