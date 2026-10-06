import { Alert } from '@/components/ui/alert'
import { Loader } from '@/components/ui/loader'

import { useAppHandler } from './use-app-handler'

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAppHandler()

  return (
    <>
      {children}
      <Loader open={isLoading} />
      <Alert />
    </>
  )
}
