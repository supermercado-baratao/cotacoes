import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  mt: 1
}

export const PriceRow: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 2
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1
}
