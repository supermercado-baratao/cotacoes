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

export const RowCheckSlot: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 34,
  height: 34,
  flexShrink: 0
}

export const SuggestionLine: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  mt: 0.25
}

const REFERENCE_CHIP_PALETTE_KEY = {
  product: 'primary',
  family: 'secondary',
  manual: 'success'
} as const

export const ReferenceChip = (
  type: 'product' | 'family' | 'manual'
): SxProps<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  px: 0.75,
  py: 0.25,
  borderRadius: 0.5,
  bgcolor: (theme) =>
    alpha(theme.palette[REFERENCE_CHIP_PALETTE_KEY[type]].main, 0.12),
  color: `${REFERENCE_CHIP_PALETTE_KEY[type]}.main`,
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  lineHeight: 1
})

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

export const SpinnerIcon: SxProps<Theme> = {
  flexShrink: 0,
  mt: 0.25,
  color: 'primary.main'
}

export const MessageAccent = (isProgress: boolean): SxProps<Theme> => ({
  width: 4,
  flexShrink: 0,
  bgcolor: isProgress ? 'primary.main' : 'warning.main',
  opacity: 0.7
})

export const AllReferencedWrapper: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1.5,
  py: 5,
  textAlign: 'center'
}

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
