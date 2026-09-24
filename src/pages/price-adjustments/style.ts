import { type SxProps, type Theme } from '@mui/material'

export const DateRangeWrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  mb: 2
}

export const DateField: SxProps<Theme> = {
  minWidth: 160
}

export const TabNavigation: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  mt: 3
}
