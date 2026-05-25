import { Backdrop, CircularProgress } from '@mui/material'

import * as S from './style'

type TLoaderProps = {
  open?: boolean
}

export const Loader = ({ open = true }: TLoaderProps) => (
  <Backdrop sx={S.Backdrop} open={open}>
    <CircularProgress />
  </Backdrop>
)
