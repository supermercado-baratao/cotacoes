import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden'
}

export const AppBar: SxProps<Theme> = {
  position: 'static',
  width: 'auto',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}

export const Content: SxProps<Theme> = {
  flex: 1,
  p: 2,
  minWidth: 0,
  overflowY: 'auto'
}

export const Title = (isCollapsed: boolean): SxProps<Theme> => ({
  display: isCollapsed ? 'none' : 'block'
})

export const Toolbar = (isCollapsed: boolean): SxProps<Theme> => ({
  justifyContent: isCollapsed ? 'center' : 'space-between'
})

export const ListItemButton = (isCollapsed: boolean): SxProps<Theme> => ({
  justifyContent: isCollapsed ? 'center' : 'flex-start'
})

export const ListItemIcon = (isCollapsed: boolean): SxProps<Theme> => ({
  minWidth: isCollapsed ? 0 : 40,
  justifyContent: 'center'
})

export const List: SxProps<Theme> = {
  flex: 1,
  overflowY: 'auto'
}

export const Footer: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  p: 1
}
