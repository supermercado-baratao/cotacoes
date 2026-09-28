import { ReceiptLong, WarningAmber } from '@mui/icons-material'
import {
  Box,
  Chip,
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

import type { TPackQuantitySource } from '@/utils'
import { formatCurrency, formatNumericValue } from '@/utils'

import type { TInvoiceEntryWithCost } from '../../../utils'
import * as S from './style'

const packSourceLabel: Record<TPackQuantitySource, string> = {
  trib: 'Conversão da nota: Qtd. Trib. ÷ Qtd. (Valor Unit. Trib. diferente do Valor Unit.)',
  supplier: 'Embalagem cadastrada no VR para o código do fornecedor',
  barcode: 'Embalagem do código de barras da nota no VR',
  default: 'Sem embalagem cadastrada no VR para este código: considerado 1'
}

type TContentProps = {
  entries: TInvoiceEntryWithCost[]
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
            <TableCell>Embalagem</TableCell>
            <TableCell>Qtd Unid.</TableCell>
            <TableCell>Custo Unid.</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map(({ invoice, item, entryCost }) => (
            <TableRow key={`${invoice.id}-${item.itemNumber}`} hover>
              <TableCell>{invoice.number}</TableCell>
              <TableCell>{invoice.supplierName.toUpperCase()}</TableCell>
              <TableCell>
                {dayjs(invoice.emissionDate).format('DD/MM/YYYY')}
              </TableCell>
              <TableCell>
                {formatNumericValue(item.quantity)} {item.unit}
              </TableCell>
              <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
              <TableCell>
                {entryCost ? (
                  <Tooltip
                    title={
                      entryCost.needsPackReview
                        ? `${packSourceLabel[entryCost.source]}. Confira a Qtd. Embalagem: a nota não converte a embalagem ${item.unit} na unidade tributável (Valor Unit. Trib. igual ao Valor Unit.).`
                        : packSourceLabel[entryCost.source]
                    }
                  >
                    <Box component="span" sx={S.PackCell}>
                      {entryCost.source === 'default'
                        ? '—'
                        : `× ${formatNumericValue(entryCost.packQuantity)}`}
                      {entryCost.needsPackReview && (
                        <WarningAmber
                          color="warning"
                          fontSize="small"
                          aria-label="Atenção: conferir quantidade da embalagem"
                        />
                      )}
                    </Box>
                  </Tooltip>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                {entryCost ? formatNumericValue(entryCost.unitQuantity) : '—'}
              </TableCell>
              <TableCell>
                {entryCost?.isBonus ? (
                  <Tooltip title="Bonificação: entra no custo médio só com a quantidade">
                    <Chip label="Bonificação" size="small" color="info" />
                  </Tooltip>
                ) : entryCost?.unitCost != null ? (
                  formatCurrency(entryCost.unitCost)
                ) : (
                  '—'
                )}
              </TableCell>
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
