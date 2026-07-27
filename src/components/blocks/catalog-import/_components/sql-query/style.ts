import { type SxProps, type Theme } from '@mui/material'

export const Banner: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  p: 2,
  mb: 3,
  borderRadius: 2,
  border: 1,
  borderColor: 'divider',
  backgroundColor: 'action.hover'
}

export const BannerText: SxProps<Theme> = {
  flex: 1
}

export const DateCenter: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 2,
  mt: 1
}

export const DialogDateField: SxProps<Theme> = {
  width: 240
}

export const CodeWrapper: SxProps<Theme> = {
  position: 'relative',
  borderRadius: 1,
  overflow: 'hidden'
}

export const CopyButton: SxProps<Theme> = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1
}

export const ShikiOutput: SxProps<Theme> = {
  '& pre': {
    m: 0,
    p: 2,
    overflow: 'auto',
    maxHeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.6,
    borderRadius: 1
  }
}

export const FallbackCode: SxProps<Theme> = {
  m: 0,
  p: 2,
  backgroundColor: 'grey.900',
  color: 'grey.100',
  fontSize: '0.75rem',
  lineHeight: 1.6,
  fontFamily: 'monospace',
  borderRadius: 1,
  overflow: 'auto',
  maxHeight: 400
}
