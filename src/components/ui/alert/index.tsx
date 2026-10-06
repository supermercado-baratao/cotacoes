import { Close } from '@mui/icons-material'
import {
  Alert as MuiAlert,
  AlertTitle,
  IconButton,
  Snackbar
} from '@mui/material'

import { useAlertStore } from '@/stores/use-alert-store'

export const Alert = () => {
  const { params, clear } = useAlertStore()

  return (
    <Snackbar
      open={!!params}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      autoHideDuration={params?.autoHideDuration || 4000}
      onClose={clear}
    >
      <MuiAlert
        severity={params?.severity}
        action={
          <IconButton size="small" onClick={clear}>
            <Close fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>{params?.title}</AlertTitle>
        {params?.description}
      </MuiAlert>
    </Snackbar>
  )
}
