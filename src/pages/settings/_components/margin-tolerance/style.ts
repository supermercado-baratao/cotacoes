import type { SxProps, Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1
}

export const GlobalRow: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  flexWrap: 'wrap'
}

export const GlobalToleranceField: SxProps<Theme> = {
  minWidth: 260
}

export const OverrideToleranceField: SxProps<Theme> = {
  minWidth: 140
}

export const List: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  mt: 1
}

export const Row: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  p: 1
}

export const AddRow: SxProps<Theme> = {
  mt: 2,
  maxWidth: 360
}
