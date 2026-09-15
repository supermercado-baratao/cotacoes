import { Box, Typography } from '@mui/material'

import * as S from './style'

export const Footer = () => (
  <Box component="footer" sx={S.Wrapper}>
    <Typography variant="body2" color="text.secondary">
      © {new Date().getFullYear()} Cotações. Todos os direitos reservados.
    </Typography>
  </Box>
)
