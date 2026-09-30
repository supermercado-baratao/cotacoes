import { type SxProps, type Theme } from '@mui/material'

export const Wrapper: SxProps<Theme> = {
  p: 2.5,
  mt: 3
}

export const DescriptionCell: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  height: '100%'
}

export const CostCell: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  width: '100%'
}

export const CostOption: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
}

export const CostOptionHeader: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1
}

export const CostOptionValue: SxProps<Theme> = {
  ml: 'auto',
  pl: 2,
  fontWeight: 'bold'
}
