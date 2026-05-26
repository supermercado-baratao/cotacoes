import {
  Button,
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material'
import type { ReactNode } from 'react'

type TDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  actions: ReactNode
  handleClose: () => void
}

export const Dialog = ({
  open,
  title,
  children,
  actions,
  handleClose
}: TDialogProps) => {
  return (
    <MuiDialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </MuiDialog>
  )
}

type TDeleteDialogProps = {
  item: string
  handleConfirm: () => void
} & Omit<TDialogProps, 'actions' | 'children'>

export const DeleteDialog = ({
  open,
  title,
  item,
  handleClose,
  handleConfirm
}: TDeleteDialogProps) => {
  return (
    <Dialog
      open={open}
      title={title}
      actions={
        <>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Excluir
          </Button>
        </>
      }
      handleClose={handleClose}
    >
      <Typography>
        Deseja excluir <strong>{item}</strong>? Esta ação não pode ser desfeita.
      </Typography>
    </Dialog>
  )
}
