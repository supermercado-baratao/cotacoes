import { Box, Chip, Paper, TablePagination, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import { PriceSummary } from '@/pages/price-adjustments/_components/table'
import type { TPriceAdjustmentDisplayRow } from '@/pages/price-adjustments/utils'

import * as S from './style'

const PAGE_SIZE = 50

type TProductListProps = {
  rows: TPriceAdjustmentDisplayRow[]
}

export const ProductList = ({ rows }: TProductListProps) => {
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pagedRows = useMemo(
    () =>
      rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [rows, currentPage]
  )

  return (
    <Box>
      {pagedRows.map((row) => (
        <Paper key={row.code} variant="outlined" sx={S.Card}>
          <Box sx={S.CardHeader}>
            <Typography sx={{ fontWeight: 600 }}>
              {row.description.toUpperCase()}
            </Typography>
            <Chip label={row.code} size="small" />
          </Box>
          <PriceSummary rows={[row]} />
        </Paper>
      ))}

      {rows.length > PAGE_SIZE && (
        <TablePagination
          component="div"
          count={rows.length}
          page={currentPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />
      )}
    </Box>
  )
}
