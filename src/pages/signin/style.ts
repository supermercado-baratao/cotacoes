import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 2
}

export const Card: SxProps<Theme> = {
  p: 4,
  width: '100%',
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  gap: 3
}

export const Form: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2
}
