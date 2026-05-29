import type { SxProps, Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
  flexWrap: 'wrap',
  mb: 2
}

export const DateSelectWrapper: SxProps<Theme> = {
  display: 'flex',
  gap: 1
}
