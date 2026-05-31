import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 2,
  minHeight: '100vh'
}

export const Paper: SxProps<Theme> = {
  p: 4,
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  alignItems: 'center',
  textAlign: 'center'
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  width: '100%',
  pt: 1
}
