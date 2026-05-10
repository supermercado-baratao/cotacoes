import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
  flexWrap: 'wrap'
}

export const SearchField: SxProps<Theme> = {
  width: { xs: '100%', sm: 320 }
}
