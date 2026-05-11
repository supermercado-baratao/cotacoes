import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
  flexWrap: 'wrap',
  mb: 2
}

export const SearchField: SxProps<Theme> = {
  flex: 1,
  maxWidth: 320
}
