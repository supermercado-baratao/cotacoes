import { Close } from '@mui/icons-material'
import {
  Box,
  IconButton,
  Modal as MuiModal,
  Paper,
  Typography
} from '@mui/material'
import { type ReactNode } from 'react'

import * as S from './style'

export type TModalProps = {
  isOpened: boolean
  title: string | { component: ReactNode }

  children: ReactNode
  handleClose(): void
}

export const Modal = ({
  isOpened,
  title,
  children,
  handleClose
}: TModalProps) => {
  return (
    <MuiModal sx={S.Wrapper} open={isOpened} onClose={handleClose}>
      <Paper sx={S.Paper}>
        <Box sx={S.Header}>
          {typeof title === 'string' ? (
            <Typography component="h2" variant="h5">
              {title}
            </Typography>
          ) : (
            title.component
          )}
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
        {children}
      </Paper>
    </MuiModal>
  )
}
