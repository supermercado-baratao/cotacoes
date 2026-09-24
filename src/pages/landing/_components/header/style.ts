import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  px: { xs: 2, md: 6 },
  py: 2
}

export const Brand: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1
}

export const Logo: SxProps<Theme> = {
  width: 32,
  height: 32
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5
}
