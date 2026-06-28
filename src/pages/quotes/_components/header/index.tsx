import { AutoFixHigh, Print } from '@mui/icons-material'
import { Box, Button, MenuItem, Select, Typography } from '@mui/material'

import { SearchInput } from '@/components'
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
  search: string
  setSearch: (search: string) => void
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  onDayChange: (day: number) => void
  handleQuoteFormOpen: (quote: TQuote | null) => void
  handleDeleteQuote: (quote: TQuote) => void
  handleAiReferenceOpen: () => void
  handlePrint: () => void
  isPrinting: boolean
}

export const Header = ({
  availableYears,
  availableMonths,
  availableDays,
  year,
  month,
  day,
  quote,
  search,
  setSearch,
  onYearChange,
  onMonthChange,
  onDayChange,
  handleQuoteFormOpen,
  handleDeleteQuote,
  handleAiReferenceOpen,
  handlePrint,
  isPrinting
}: THeaderProps) => {
  const days = getDaysInYearMonth(year, month)

  return (
    <Box sx={S.Wrapper}>
      <Box sx={S.TopRow}>
        <Typography variant="h5" component="h1">
          Cotações
        </Typography>

        <Box sx={S.DateSelectWrapper}>
          <Select
            value={day}
            onChange={(e) => onDayChange(Number(e.target.value))}
            size="small"
          >
            {[...days].reverse().map((d) => (
              <MenuItem key={d} value={d} disabled={!availableDays.includes(d)}>
                {d}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            size="small"
          >
            {[...MONTHS].reverse().map((m, reverseIndex) => {
              const value = MONTHS.length - reverseIndex
              return (
                <MenuItem
                  key={value}
                  value={value}
                  disabled={!availableMonths.includes(value)}
                >
                  {m}
                </MenuItem>
              )
            })}
          </Select>
          <Select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            size="small"
          >
            {availableYears.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <SearchInput
          placeholder="Pesquisar itens..."
          value={search}
          onValueChange={setSearch}
          sx={{ width: 260 }}
        />
      </Box>

      <Box sx={S.Actions}>
        <Button variant="contained" onClick={() => handleQuoteFormOpen(null)}>
          Nova Cotação
        </Button>
        {quote && (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleQuoteFormOpen(quote)}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteQuote(quote)}
            >
              Excluir
            </Button>
          </>
        )}
        {quote && quote.items.length > 0 && (
          <>
            <Button
              variant="outlined"
              startIcon={<AutoFixHigh />}
              onClick={handleAiReferenceOpen}
            >
              Referenciar com IA
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
              disabled={isPrinting}
            >
              Imprimir
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
