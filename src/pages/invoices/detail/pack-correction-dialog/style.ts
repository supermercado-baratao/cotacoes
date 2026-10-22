import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap: 2
}

export const FullWidth: SxProps<Theme> = {
  gridColumn: { sm: '1 / -1' }
}

export const Details: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap: 2,
  gridColumn: { sm: '1 / -1' },
  m: 0
}

export const DetailLabel: SxProps<Theme> = {
  typography: 'body2',
  color: 'text.secondary'
}

export const DetailValue: SxProps<Theme> = {
  m: 0
}

export const PreviewDetail: SxProps<Theme> = {
  m: 0
}

export const PreviewNote: SxProps<Theme> = {
  m: 0,
  typography: 'caption',
  color: 'text.secondary'
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: 1,
  gridColumn: { sm: '1 / -1' },
  mt: 1
}

export const RemoveButton: SxProps<Theme> = {
  mr: 'auto'
}
