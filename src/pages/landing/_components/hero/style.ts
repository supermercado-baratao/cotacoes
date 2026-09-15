import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  px: { xs: 2, md: 6 },
  py: { xs: 8, md: 12 }
}

export const Glow: SxProps<Theme> = {
  position: 'absolute',
  top: '-20%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 720,
  height: 720,
  maxWidth: '150vw',
  borderRadius: '50%',
  background:
    'radial-gradient(circle, rgba(134,59,255,0.35) 0%, rgba(71,191,255,0.12) 45%, rgba(0,0,0,0) 70%)',
  filter: 'blur(10px)',
  pointerEvents: 'none',
  zIndex: 0
}

export const Content: SxProps<Theme> = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 3,
  maxWidth: 720
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  flexWrap: 'wrap',
  justifyContent: 'center'
}
