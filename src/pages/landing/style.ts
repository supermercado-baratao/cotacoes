import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
}

export const Main: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
}
