import { Logout } from '@mui/icons-material'
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
  Typography
} from '@mui/material'
import { signOut } from 'firebase/auth'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { auth } from '@/infra'

import { navItems } from './nav-items'
import * as S from './style'

export const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = () => signOut(auth)

  return (
    <Box sx={S.Wrapper}>
      <AppBar sx={S.AppBar} position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">Cotações</Typography>
          <Tooltip title="Sair">
            <IconButton onClick={handleSignOut} size="small" color="inherit">
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Divider />
        <List>
          {navItems.map(({ label, path, icon: Icon }) => (
            <ListItem key={path} disablePadding>
              <ListItemButton
                selected={location.pathname === path}
                onClick={() => navigate(path)}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </AppBar>
      <Box sx={S.Content}>
        <Outlet />
      </Box>
    </Box>
  )
}
