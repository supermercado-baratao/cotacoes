import { Box, Paper, Typography } from '@mui/material'

import { features } from './data'
import * as S from './style'

export const Features = () => (
  <Box component="section" sx={S.Wrapper}>
    <Box sx={S.Heading}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        Tudo que o setor de compras precisa
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Da cotação ao pedido, centralize o processo de compras do seu
        supermercado.
      </Typography>
    </Box>
    <Box sx={S.Grid}>
      {features.map(({ title, description, icon: Icon }) => (
        <Paper key={title} elevation={2} sx={S.Card}>
          <Box sx={S.IconWrapper}>
            <Icon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Paper>
      ))}
    </Box>
  </Box>
)
