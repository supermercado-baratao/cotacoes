import { ArrowRight } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'

import * as S from './style'

type THistoryCellProps = {
  currentValue: number
  lastValue?: number
  formatValue: (value: number) => string
  handleClick: () => void
}

export const HistoryCell = ({
  currentValue,
  lastValue,
  formatValue,
  handleClick
}: THistoryCellProps) => {
  const hasHistory = lastValue !== undefined

  return (
    <Box
      sx={{ ...S.Wrapper, cursor: hasHistory ? 'pointer' : 'default' }}
      onClick={hasHistory ? handleClick : undefined}
    >
      {hasHistory && (
        <>
          <Typography color="textSecondary">
            {formatValue(lastValue)}
          </Typography>
          <ArrowRight />
        </>
      )}
      <Typography>{formatValue(currentValue)}</Typography>
    </Box>
  )
}
