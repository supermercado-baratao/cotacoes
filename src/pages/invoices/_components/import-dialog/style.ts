import type { SxProps, Theme } from '@mui/material'

export const NfeHeader: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1,
  p: 2
}

export const ChipRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mt: 0.5
}

export const ItemDescriptionCell: SxProps<Theme> = {
  maxWidth: 200,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1,
  mt: 2
}
