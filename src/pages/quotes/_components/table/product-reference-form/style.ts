import { type SxProps, type Theme } from '@mui/material'
import { alpha } from '@mui/material/styles'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  mt: 1
}

export const ItemBanner: SxProps<Theme> = {
  borderLeft: '3px solid',
  borderColor: 'primary.main',
  borderRadius: '0 4px 4px 0',
  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
  px: 1.5,
  py: 1,
  mb: 1
}

export const ItemLabel: SxProps<Theme> = {
  display: 'block',
  color: 'primary.main',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  lineHeight: 1,
  mb: 0.5
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
