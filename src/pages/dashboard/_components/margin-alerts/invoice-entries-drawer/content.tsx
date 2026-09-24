import { ReceiptLong } from '@mui/icons-material'
import {
  Box,
  IconButton,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { Link } from 'react-router'

import { formatCurrency, formatNumericValue } from '@/utils'

import type { TInvoiceEntry } from '../../../utils'
import * as S from './style'

type TContentProps = {
  entries: TInvoiceEntry[]
}

export const Content = ({ entries }: TContentProps) => {
  if (entries.length === 0) {
    return (
      <Box sx={S.EmptyState}>
        <Typography variant="body2" color="text.secondary">
          Nenhuma nota encontrada para este produto no período selecionado.
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer sx={S.TableContainer}>
      <MuiTable size="small" stickyHeader sx={S.Table}>
        <TableHead>
          <TableRow>
            <TableCell>Nota</TableCell>
            <TableCell>Fornecedor</TableCell>
            <TableCell>Emissão</TableCell>
            <TableCell>Qtd</TableCell>
            <TableCell>Preço Unit.</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map(({ invoice, item }) => (
            <TableRow key={`${invoice.id}-${item.itemNumber}`} hover>
              <TableCell>{invoice.number}</TableCell>
              <TableCell>{invoice.supplierName.toUpperCase()}</TableCell>
              <TableCell>
                {dayjs(invoice.emissionDate).format('DD/MM/YYYY')}
              </TableCell>
              <TableCell>{formatNumericValue(item.quantity)}</TableCell>
              <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
              <TableCell align="right">
                <Tooltip title="Ver nota fiscal">
                  <IconButton
                    size="small"
                    component={Link}
                    to={`/invoices/${invoice.id}`}
                    aria-label="Ver nota fiscal"
                  >
                    <ReceiptLong fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  )
}
