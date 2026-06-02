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

export const HeaderInfo: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  minWidth: 0
}

export const HeaderInfoInner: SxProps<Theme> = {
  minWidth: 0
}

export const HeaderTitle: SxProps<Theme> = {
  fontWeight: 700,
  lineHeight: 1.2,
  textTransform: 'uppercase'
}

export const HeaderChipRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mt: 0.5
}

export const HeaderActions: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center',
  flexShrink: 0,
  ml: 2
}

export const EmptyState: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  p: 4
}

export const EmptyStateText: SxProps<Theme> = {
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

export const TableRowActions: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
  justifyContent: 'flex-end'
}

export const ObservationsText: SxProps<Theme> = {
  cursor: 'default',
  alignSelf: 'center',
  mr: 0.5
}
