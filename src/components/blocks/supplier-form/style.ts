import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
  gap: 2,
  mt: 1,
  '.MuiInputBase-input': {
    textTransform: 'uppercase'
  }
}

export const FullWidth: SxProps<Theme> = {
  gridColumn: { sm: '1 / -1' }
}

export const OneCol: SxProps<Theme> = {
  gridColumn: { sm: 'span 1' }
}

export const TwoCol: SxProps<Theme> = {
  gridColumn: { sm: 'span 2' }
}

export const EmailField: SxProps<Theme> = {
  gridColumn: { sm: '1 / -1' },
  '.MuiInputBase-input': { textTransform: 'none' }
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1,
  gridColumn: { sm: '1 / -1' }
}
