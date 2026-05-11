import {
  AppBar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { navItems } from './nav-items'
import * as S from './style'

export const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={S.Wrapper}>
      <AppBar sx={S.AppBar} position="fixed">
        <Toolbar>
          <Typography variant="h6">Cotações</Typography>
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
