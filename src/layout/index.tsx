import { Logout, Menu, MenuOpen } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { signOut } from 'firebase/auth'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { auth } from '@/infra'

import { navItems } from './nav-items'
import * as S from './style'

export const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [manualCollapse, setManualCollapse] = useState<boolean | null>(null)

  const isCollapsed = manualCollapse ?? isSmallScreen
  const handleToggle = () => setManualCollapse(!isCollapsed)
  const handleSignOut = () => signOut(auth)

  return (
    <Box sx={S.Wrapper}>
      <AppBar sx={S.AppBar} position="fixed">
        <Toolbar sx={S.Toolbar(isCollapsed)}>
          <Typography variant="h6" sx={S.Title(isCollapsed)}>
            Cotações
          </Typography>
          <Tooltip title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}>
            <IconButton onClick={handleToggle} size="small" color="inherit">
              {isCollapsed ? (
                <Menu fontSize="small" />
              ) : (
                <MenuOpen fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Divider />
        <List sx={S.List}>
          {navItems.map(({ label, path, icon: Icon }) => (
            <ListItem key={path} disablePadding>
              <Tooltip
                title={label}
                placement="right"
                disableHoverListener={!isCollapsed}
              >
                <ListItemButton
                  selected={location.pathname === path}
                  onClick={() => navigate(path)}
                  sx={S.ListItemButton(isCollapsed)}
                >
                  <ListItemIcon sx={S.ListItemIcon(isCollapsed)}>
                    <Icon />
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary={label} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={S.Footer}>
          <Tooltip title="Sair">
            <IconButton onClick={handleSignOut} size="small" color="inherit">
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </AppBar>
      <Box sx={S.Content}>
        <Outlet />
      </Box>
    </Box>
  )
}
