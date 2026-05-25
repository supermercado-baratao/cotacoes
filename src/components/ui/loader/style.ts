import type { SxProps, Theme } from '@mui/material'

export const Backdrop: SxProps<Theme> = (theme: Theme) => ({
  zIndex: theme.zIndex.drawer + 1
})
