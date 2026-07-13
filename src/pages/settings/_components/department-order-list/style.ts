import type { SxProps, Theme } from '@mui/material'

export const List: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1
}

export const Row: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  p: 1
}
