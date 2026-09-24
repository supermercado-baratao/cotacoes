import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  px: { xs: 2, md: 6 },
  py: { xs: 6, md: 10 },
  display: 'flex',
  flexDirection: 'column',
  gap: 5
}

export const Heading: SxProps<Theme> = {
  textAlign: 'center',
  maxWidth: 560,
  mx: 'auto'
}

export const Grid: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 3
}

export const Card: SxProps<Theme> = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5
}

export const IconWrapper: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: 2,
  bgcolor: 'primary.main',
  color: 'primary.contrastText'
}
