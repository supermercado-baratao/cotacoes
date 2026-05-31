import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'

import { Loader } from '@/components'
import { auth } from '@/infra'
import { useAuthStore } from '@/stores'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser } = useAuthStore()

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setIsInitialized(true)
    })

    return () => unsubscribe()
  }, [setUser])

  if (!isInitialized) return <Loader open />

  return children
}
