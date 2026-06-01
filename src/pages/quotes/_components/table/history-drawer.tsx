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

import { useProductHistory } from '../use-product-history'

type THistoryDrawerProps = {
  productId: string | null
  productName: string | null
  onClose: () => void
}

export const HistoryDrawer = ({
  productId,
  productName,
  onClose
}: THistoryDrawerProps) => {
  const { history } = useProductHistory()

  return (
    <Drawer
      anchor="right"
      open={!!productId}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 560 } } } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {productName?.toUpperCase()}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', px: 2, pt: 1.5, pb: 0.5 }}
      >
        Histórico de pedidos
      </Typography>
      <TableContainer>
        <MuiTable size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: 'background.paper'
                }}
              >
                Data
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: 'background.paper'
                }}
              >
                Custo
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: 'background.paper'
                }}
              >
                Fornecedor
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: 'background.paper'
                }}
              >
                Vendedor
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: 'background.paper'
                }}
              >
                Qtd
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: 'background.paper'
                }}
              >
                Embalagem
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!history.length ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
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
