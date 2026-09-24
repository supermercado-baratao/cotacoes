import type { SxProps, Theme } from '@mui/material'

export const Divider: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center',
  height: '50%',
  position: 'relative',
  top: '50%',
  transform: 'translateY(-50%)'
}

export const DescriptionCell: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center'
}

export const CostCell: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center'
}

export const SummaryContent: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  width: '100%'
}

export const SummaryHeader: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  alignItems: 'center'
}

export const PriceSummary: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 1.5,
  px: 1.5,
  py: 1,
  borderRadius: 1.5,
  bgcolor: 'action.hover'
}

export const PriceSummaryItem: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25,
  minWidth: 84
}

export const PriceSummaryItemLabel: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5
}

export const PriceSummaryDivider: SxProps<Theme> = {
  width: '1px',
  alignSelf: 'stretch',
  bgcolor: 'divider'
}

export const PriceSummaryTrend: SxProps<Theme> = {
  display: 'flex',
  alignSelf: 'center'
}
