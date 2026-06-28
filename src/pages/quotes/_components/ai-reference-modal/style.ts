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
  gap: 2
}

export const LoaderFooter: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  px: 0.5
}

export const MessageBox: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  minHeight: 80,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden'
}

export const MessageBoxContent: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center'
}

export const MessageAccent = (isProgress: boolean): SxProps<Theme> => ({
  width: 4,
  flexShrink: 0,
  bgcolor: isProgress ? 'primary.main' : 'warning.main',
  opacity: 0.7
})

export const MessageContent: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.5,
  p: 2,
  flex: 1,
  '@keyframes fadeInSlide': {
    from: { opacity: 0, transform: 'translateY(5px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  animation: 'fadeInSlide 0.4s ease'
}
