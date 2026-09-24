import { Close } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'

import type { TMarginAlert } from '../../../utils'
import * as S from './style'

type THeaderProps = {
  alert: TMarginAlert | null
  entryCount: number
  handleClose: () => void
}

export const Header = ({ alert, entryCount, handleClose }: THeaderProps) => (
  <Box sx={S.Header}>
    <Box sx={S.HeaderInfoInner}>
      <Typography variant="h6" sx={S.HeaderTitle} noWrap>
        {alert?.description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {entryCount === 0
          ? 'Nenhuma nota encontrada'
          : `${entryCount} nota${entryCount > 1 ? 's' : ''} encontrada${entryCount > 1 ? 's' : ''}`}
      </Typography>
    </Box>
    <IconButton size="small" onClick={handleClose}>
      <Close fontSize="small" />
    </IconButton>
  </Box>
)
