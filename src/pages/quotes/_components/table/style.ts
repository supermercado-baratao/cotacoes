import type { SxProps, Theme } from '@mui/material'

export const Divider: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center',
  height: '50%',
  position: 'relative',
  top: '50%',
  transform: 'translateY(-50%)'
}
