import type { SxProps, Theme } from '@mui/material'

export const Paper: SxProps<Theme> = {
  width: { xs: '100%', sm: 700 },
  display: 'flex',
  flexDirection: 'column'
}

export const Header: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 2.5,
  py: 2,
  borderBottom: '1px solid',
  borderColor: 'divider',
  flexShrink: 0
}

export const HeaderInfoInner: SxProps<Theme> = {
  minWidth: 0
}

export const HeaderTitle: SxProps<Theme> = {
  fontWeight: 700,
  lineHeight: 1.2,
  textTransform: 'uppercase'
}

export const EmptyState: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 4,
  textAlign: 'center'
}

export const TableContainer: SxProps<Theme> = {
  flex: 1
}

export const Table: SxProps<Theme> = {
  th: {
    backgroundColor: 'secondary.dark'
  }
}
