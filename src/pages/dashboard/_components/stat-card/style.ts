import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  p: 2.5,
  display: 'flex',
  alignItems: 'center',
  gap: 2
}

export const IconWrapper = (
  color: 'primary' | 'warning' | 'error'
): SxProps<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: 2,
  bgcolor: `${color}.main`,
  color: `${color}.contrastText`,
  flexShrink: 0
})
