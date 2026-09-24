import { type SvgIconComponent } from '@mui/icons-material'
import { Box, Paper, Typography } from '@mui/material'

import * as S from './style'

type TStatCardProps = {
  label: string
  value: string
  icon: SvgIconComponent
  color?: 'primary' | 'warning' | 'error'
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  color = 'primary'
}: TStatCardProps) => (
  <Paper elevation={2} sx={S.Wrapper}>
    <Box sx={S.IconWrapper(color)}>
      <Icon />
    </Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Paper>
)
