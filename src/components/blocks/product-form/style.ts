import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(6, 1fr)' },
  gap: 2,
  mt: 2,
  '.MuiInputBase-input': {
    textTransform: 'uppercase'
  }
}

export const FullWidth: SxProps<Theme> = {
  gridColumn: { sm: '1 / -1' }
}

export const TwoCol: SxProps<Theme> = {
  gridColumn: { sm: 'span 2' }
}

export const ThreeCol: SxProps<Theme> = {
  gridColumn: { sm: 'span 3' }
}

export const MarginField: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1
}

export const FourCol: SxProps<Theme> = {
  gridColumn: { sm: 'span 4' }
}

export const FiveCol: SxProps<Theme> = {
  gridColumn: { sm: 'span 5' }
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1,
  mt: 2
}
