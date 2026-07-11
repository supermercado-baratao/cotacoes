import type { SxProps, Theme } from '@mui/material'

export const HeaderRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  mb: 3,
  gap: 1
}

export const ItemsHeader: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 1.5
}

export const ChipRow: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1,
  mb: 2
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 2
}
