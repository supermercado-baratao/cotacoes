import { AutoFixHigh, Print } from '@mui/icons-material'
import { Box, Button, MenuItem, Select, Typography } from '@mui/material'

import type { TQuote } from '@/models'

import { MONTHS } from './constants'
import * as S from './style'
import { getDaysInYearMonth } from './utils'

type THeaderProps = {
  availableYears: number[]
  availableMonths: number[]
  availableDays: number[]
  year: number
  month: number
  day: number
  quote: TQuote | null
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  onDayChange: (day: number) => void
  handleQuoteFormOpen: (quote: TQuote | null) => void
  handleDeleteQuote: (quote: TQuote) => void
  handleAiReferenceOpen: () => void
  handlePrint: () => void
}

export const Header = ({
  availableYears,
  availableMonths,
  availableDays,
  year,
  month,
  day,
  quote,
  onYearChange,
  onMonthChange,
  onDayChange,
  handleQuoteFormOpen,
  handleDeleteQuote,
  handleAiReferenceOpen,
  handlePrint
}: THeaderProps) => {
  const days = getDaysInYearMonth(year, month)

  return (
    <Box sx={S.Wrapper}>
      <Typography variant="h5" component="h1">
        Cotações
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {quote && (
          <>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteQuote(quote)}
            >
              Excluir Cotação
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleQuoteFormOpen(quote)}
            >
              Editar Cotação
            </Button>
            {quote.items.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<AutoFixHigh />}
                onClick={handleAiReferenceOpen}
              >
                Referenciar com IA
              </Button>
            )}
            {quote.items.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
              >
                Imprimir
              </Button>
            )}
          </>
        )}
        <Button variant="contained" onClick={() => handleQuoteFormOpen(null)}>
          Nova Cotação
        </Button>
      </Box>

      <Box sx={S.DateSelectWrapper}>
        <Select
          value={day}
          onChange={(e) => onDayChange(Number(e.target.value))}
          size="small"
        >
          {[...days].reverse().map((day) => (
            <MenuItem
              key={day}
              value={day}
              disabled={!availableDays.includes(day)}
            >
              {day}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          size="small"
        >
          {[...MONTHS].reverse().map((month, reverseIndex) => {
            const value = MONTHS.length - reverseIndex
            return (
              <MenuItem
                key={value}
                value={value}
                disabled={!availableMonths.includes(value)}
              >
                {month}
              </MenuItem>
            )
          })}
        </Select>
        <Select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          size="small"
        >
          {availableYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  )
}
