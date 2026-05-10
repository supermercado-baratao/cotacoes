import { Backdrop, CircularProgress } from '@mui/material'

type TLoaderProps = {
  open?: boolean
}

export const Loader = ({ open = true }: TLoaderProps) => {
  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
      open={open}
    >
      <CircularProgress />
    </Backdrop>
  )
}
