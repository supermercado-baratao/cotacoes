import type { SxProps, Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  mt: 1
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1
}
