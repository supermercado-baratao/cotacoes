import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  border: 2,
  borderColor: 'divider',
  borderRadius: 2,
  p: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  cursor: 'pointer',
  transition: 'border-color 0.2s, background-color 0.2s',
  '&:hover': {
    borderColor: 'primary.main',
    backgroundColor: 'action.hover'
  }
}

export const Icon: SxProps<Theme> = {
  fontSize: 72,
  color: 'primary.main'
}
