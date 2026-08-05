import { type SxProps, type Theme } from '@mui/material'
import { alpha } from '@mui/material/styles'

export const ItemBanner: SxProps<Theme> = {
  borderLeft: '3px solid',
  borderColor: 'primary.main',
  borderRadius: '0 4px 4px 0',
  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
  px: 1.5,
  py: 1,
  mb: 1,
  gridColumn: { sm: '1 / -1' }
}

export const ItemLabel: SxProps<Theme> = {
  display: 'block',
  color: 'primary.main',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  lineHeight: 1,
  mb: 0.5
}

export const OutlierNote: SxProps<Theme> = {
  mb: 2
}

export const Wrapper: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
  gap: 2,
  '.MuiInputBase-input': {
    textTransform: 'uppercase'
  },
  '.MuiInputBase-input[readonly]': {
    cursor: 'default',
    color: 'text.secondary'
  }
}

export const TwoCol: SxProps<Theme> = {
  gridColumn: { sm: 'span 2' }
}

export const TwoColRowStart: SxProps<Theme> = {
  gridColumn: { sm: '1 / span 2' }
}

export const FullWidth: SxProps<Theme> = {
  gridColumn: { sm: '1 / -1' }
}

export const CellInput: SxProps<Theme> = {
  minWidth: 96,
  '.MuiInputBase-input': {
    textAlign: 'right',
    py: 0.5
  }
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1,
  gridColumn: { sm: '1 / -1' },
  mt: 1
}
