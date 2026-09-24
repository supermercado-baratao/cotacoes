import { type SxProps, type Theme } from '@mui/material'

export const StatsGrid: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 2
}

export const DateRangeWrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  mt: 4,
  mb: 3
}

export const DateField: SxProps<Theme> = {
  minWidth: 160
}
