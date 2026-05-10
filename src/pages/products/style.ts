import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  p: { xs: 2, sm: 3 },
  height: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  gap: 2
}
