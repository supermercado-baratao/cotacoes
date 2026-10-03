import { sendEmailVerification, signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { auth } from '@/infra'
import { useAlertStore, useAuthStore } from '@/stores'

const COOLDOWN_SECONDS = 60

export const usePageHandler = () => {
  const { user, setUser } = useAuthStore()
  const alert = useAlertStore((state) => state.alert)

  const navigate = useNavigate()

  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResendClick = async () => {
    try {
      await sendEmailVerification(auth.currentUser!)
      setCooldown(COOLDOWN_SECONDS)
    } catch {
      alert({
        title: 'Erro',
        description: 'Tente novamente mais tarde.',
        severity: 'error'
      })
    }
  }

  const handleLoginClick = async () => {
    try {
      await auth.currentUser!.reload()
      // reload() doesn't refresh the ID token, and firestore.rules checks its email_verified claim
      await auth.currentUser!.getIdToken(true)
      setUser(auth.currentUser)
      navigate('/dashboard', { replace: true })
    } catch {
      alert({
        title: 'Erro',
        description: 'Erro ao verificar o e-mail. Tente novamente.',
        severity: 'error'
      })
    }
  }

  const handleLogoutClick = () => signOut(auth)

  return {
    user,
    cooldown,
    handleResendClick,
    handleLoginClick,
    handleLogoutClick
  }
}
