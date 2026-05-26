import { Typography } from '@mui/material'

import { Loader } from '../../ui/loader'

type TDataViewProps = {
  isFetching: boolean
  isEmpty: boolean
  emptyMessage: string
  children: React.ReactNode
}

export const DataView = ({
  isFetching,
  isEmpty,
  emptyMessage,
  children
}: TDataViewProps) => {
  if (isFetching) return <Loader />
  if (isEmpty) return <Typography sx={{ mt: 2 }}>{emptyMessage}</Typography>
  return children
}
