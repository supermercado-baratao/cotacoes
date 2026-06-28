import type { SxProps, Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  mb: 2
}

export const TopRow: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: 2
}

export const DateSelectWrapper: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  gap: 1
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  gap: 1
}
