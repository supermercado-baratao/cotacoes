import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden'
}

export const AppBar: SxProps<Theme> = {
  position: 'static',
  width: 'auto',
  height: '100%'
}

export const Content: SxProps<Theme> = {
  flex: 1,
  p: 2,
  minWidth: 0,
  overflowY: 'auto'
}
