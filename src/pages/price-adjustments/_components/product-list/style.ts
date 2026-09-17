import type { SxProps, Theme } from '@mui/material'

export const Card: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  p: 2,
  mb: 1.5
}

export const CardHeader: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center'
}
