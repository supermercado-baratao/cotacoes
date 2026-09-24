import { type SxProps, type Theme } from '@mui/material'

export const StatsGrid: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 2
}
