import type { SxProps, Theme } from '@mui/material'

export const Paper: SxProps<Theme> = {
  width: { xs: '100%', sm: 560 }
}

export const Header: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 2,
  py: 1.5,
  borderBottom: '1px solid',
  borderColor: 'divider'
}

export const HeaderTitle: SxProps<Theme> = {
  fontWeight: 600
}

export const SectionLabel: SxProps<Theme> = {
  display: 'block',
  px: 2,
  pt: 1.5,
  pb: 0.5
}

export const TableHead: SxProps<Theme> = {
  th: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    backgroundColor: 'background.paper'
  }
}

export const EmptyCell: SxProps<Theme> = {
  textAlign: 'center',
  py: 4
}
