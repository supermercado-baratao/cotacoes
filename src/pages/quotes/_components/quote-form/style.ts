import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  mt: 1
}

export const ProductsSection: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1
}

export const ProductSearchRow: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
  alignItems: 'stretch'
}

export const ListInfo: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between'
}

export const ProductList: SxProps<Theme> = {
  maxHeight: 220,
  overflow: 'auto',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  p: 0
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1
}
