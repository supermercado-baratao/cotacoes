import { Close } from '@mui/icons-material'
import {
  Box,
  Drawer,
  IconButton,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'

import { formatCurrency, formatNumericValue } from '@/utils'

import { useProductHistory } from '../../use-product-history'
import * as S from './style'

type THistoryDrawerProps = {
  productId: string | null
  productName: string | null
  handleClose: () => void
}

export const HistoryDrawer = ({
  productId,
  productName,
  handleClose
}: THistoryDrawerProps) => {
  const { history } = useProductHistory()

  return (
    <Drawer
      anchor="right"
      open={!!productId}
      onClose={handleClose}
      slotProps={{ paper: { sx: S.Paper } }}
    >
      <Box sx={S.Header}>
        <Typography variant="subtitle1" sx={S.HeaderTitle}>
          {productName?.toUpperCase()}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={S.SectionLabel}>
        Histórico de pedidos
      </Typography>
      <TableContainer>
        <MuiTable size="small" stickyHeader>
          <TableHead sx={S.TableHead}>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Custo</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell>Qtd</TableCell>
              <TableCell>Embalagem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!history.length ? (
              <TableRow>
                <TableCell colSpan={6} sx={S.EmptyCell}>
                  <Typography variant="body2" color="text.secondary">
                    Sem histórico de pedidos anteriores.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              history.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{dayjs(row.date).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{formatCurrency(row.price)}</TableCell>
                  <TableCell>{row.supplierName.toUpperCase()}</TableCell>
                  <TableCell>{row.sellerName?.toUpperCase() ?? '—'}</TableCell>
                  <TableCell>{formatNumericValue(row.quantity)}</TableCell>
                  <TableCell>{row.packing.toUpperCase()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Drawer>
  )
}
