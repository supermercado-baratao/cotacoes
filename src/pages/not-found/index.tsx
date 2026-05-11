import { Box, Typography } from '@mui/material'

import * as S from './style'

export const NotFound = () => {
  return (
    <Box sx={S.Wrapper}>
      <Typography>404 - Not Found</Typography>
    </Box>
  )
}
