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

export const SuggestionsWrapper: SxProps<Theme> = {
  px: 2.5,
  py: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  maxHeight: 360,
  overflowY: 'auto'
}

export const InvoiceGroupTitle: SxProps<Theme> = {
  fontWeight: 600,
  display: 'block',
  mb: 0.5
}

export const InvoiceGroupList: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5
}

export const SuggestionItem = (likely: boolean): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  px: 1.5,
  py: 0.75,
  borderRadius: 1,
  border: '1px solid',
  borderColor: likely ? 'success.main' : 'divider',
  '&:hover': { bgcolor: 'action.hover' }
})

export const SuggestionItemHeader: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75
}

export const LikelyChip: SxProps<Theme> = {
  height: 16,
  flexShrink: 0,
  '& .MuiChip-label': { px: 0.75, fontSize: '0.625rem' }
}

export const OtherNotesLink: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.25,
  textDecoration: 'none'
}

export const OtherNotesList: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  mt: 1
}
