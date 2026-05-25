import type { SxProps, Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'stretch',
  gap: 0.5
}

export const Inner: SxProps<Theme> = {
  flex: 1
}

export const AddButton: SxProps<Theme> = {
  minWidth: 'auto'
}
