import type { SxProps, Theme } from '@mui/material'
import { alpha } from '@mui/material/styles'

export const List: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  mt: 1,
  maxHeight: '60vh',
  overflowY: 'auto',
  pr: 0.5
}

export const Row: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  p: 1.5,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider'
}

export const RowContent: SxProps<Theme> = {
  flex: 1,
  minWidth: 0
}

export const SuggestionLine: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  mt: 0.25
}

export const ReferenceChip = (type: 'product' | 'family'): SxProps<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  px: 0.75,
  py: 0.25,
  borderRadius: 0.5,
  bgcolor: (theme) =>
    alpha(
      type === 'product'
        ? theme.palette.primary.main
        : theme.palette.secondary.main,
      0.12
    ),
  color: type === 'product' ? 'primary.main' : 'secondary.main',
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  lineHeight: 1
})

export const ReferencedBadge: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 0.75,
  py: 0.25,
  borderRadius: 0.5,
  bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
  color: 'success.main',
  fontSize: '0.7rem',
  fontWeight: 600
}

export const Actions: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1,
  mt: 2
}

export const LoaderWrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  py: 6
}

export const EmptyState: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  py: 4,
  px: 2,
  alignItems: 'center',
  textAlign: 'center'
}

export const UncachedNotice: SxProps<Theme> = {
  mt: 1.5,
  p: 1.5,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  display: 'flex',
  flexDirection: 'column',
  gap: 1
}

export const UncachedItemList: SxProps<Theme> = {
  pl: 2,
  m: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25
}

export const AnalyzeBanner: SxProps<Theme> = {
  mt: 1.5,
  p: 1.5,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  display: 'flex',
  alignItems: 'center',
  gap: 1.5
}
