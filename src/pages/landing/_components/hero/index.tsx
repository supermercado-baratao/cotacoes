import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'

import * as S from './style'

export const Hero = () => (
  <Box component="section" sx={S.Wrapper}>
    <Box sx={S.Glow} />
    <Box sx={S.Content}>
      <Typography
        variant="h2"
        sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', md: '3rem' } }}
      >
        Cotações e pedidos sob controle, do fornecedor à prateleira
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
        Compare preços entre fornecedores, importe notas fiscais e mantenha o
        catálogo do seu supermercado sempre atualizado, em um só lugar.
      </Typography>
      <Box sx={S.Actions}>
        <Button
          component={RouterLink}
          to="/signup"
          variant="contained"
          size="large"
        >
          Criar conta grátis
        </Button>
        <Button
          component={RouterLink}
          to="/signin"
          variant="outlined"
          size="large"
        >
          Entrar
        </Button>
      </Box>
    </Box>
  </Box>
)
