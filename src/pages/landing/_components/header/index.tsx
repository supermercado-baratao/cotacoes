import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'

import * as S from './style'

export const Header = () => (
  <Box component="header" sx={S.Wrapper}>
    <Box sx={S.Brand}>
      <Box component="img" src="/favicon.svg" alt="Cotações" sx={S.Logo} />
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Cotações
      </Typography>
    </Box>
    <Box sx={S.Actions}>
      <Button component={RouterLink} to="/signin" color="inherit">
        Entrar
      </Button>
      <Button component={RouterLink} to="/signup" variant="contained">
        Criar conta
      </Button>
    </Box>
  </Box>
)
