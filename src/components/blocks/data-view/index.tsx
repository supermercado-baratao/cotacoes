import { Typography } from '@mui/material'

import { useAppStore } from '@/stores'

import { Loader } from '../../ui/loader'
import { FetchError } from '../fetch-error'

type TDataViewProps = {
  isFetching: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: React.ReactNode
}

export const DataView = ({
  isFetching,
  isEmpty = false,
  emptyMessage,
  children
}: TDataViewProps) => {
  const fetchErrorCode = useAppStore((state) => state.fetchErrorCode)
  const retryFetch = useAppStore((state) => state.retryFetch)

  if (isFetching && fetchErrorCode)
    return <FetchError code={fetchErrorCode} handleRetryClick={retryFetch} />
  if (isFetching) return <Loader />
  if (isEmpty) return <Typography sx={{ mt: 2 }}>{emptyMessage}</Typography>
  return children
}
