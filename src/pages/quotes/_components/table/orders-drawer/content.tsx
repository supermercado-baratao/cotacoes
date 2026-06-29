import { Add, Delete, Edit, ReceiptLong } from '@mui/icons-material'
import {
  Box,
  Button,
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

import type { TOrder, TProduct, TSeller, TSupplier } from '@/models'
import { formatCurrency, formatNumericValue } from '@/utils'

import * as S from './style'
import { getProductDescription, getSellerName, getSupplierName } from './utils'

type TContentProps = {
  itemOrders: TOrder[]
  products: TProduct[]
  suppliers: TSupplier[]
  sellers: TSeller[]
  handleOrderFormOpen: (order: TOrder | null) => void
  handleDeleteOrder: (order: TOrder) => void
}

export const Content = ({
  itemOrders,
  products,
  suppliers,
  sellers,
  handleOrderFormOpen,
  handleDeleteOrder
}: TContentProps) => {
  if (itemOrders.length === 0) {
    return (
      <Box sx={S.EmptyState}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={S.EmptyStateText}
        >
          Nenhum pedido registrado para este item.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={() => handleOrderFormOpen(null)}
        >
          Registrar primeiro pedido
        </Button>
      </Box>
    )
  }

  return (
    <TableContainer sx={S.TableContainer}>
      <MuiTable size="small" stickyHeader sx={S.Table}>
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell>Fornecedor</TableCell>
            <TableCell>Vendedor</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Qtd</TableCell>
            <TableCell>Embalagem</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemOrders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>
                {getProductDescription(order.productId, products).toUpperCase()}
              </TableCell>
              <TableCell>
                {getSupplierName(order.supplierId, suppliers).toUpperCase()}
              </TableCell>
              <TableCell>
                {getSellerName(order.sellerId, sellers).toUpperCase()}
              </TableCell>
              <TableCell>{formatCurrency(order.price)}</TableCell>
              <TableCell>{formatNumericValue(order.quantity)}</TableCell>
              <TableCell>{order.packing.toUpperCase()}</TableCell>
              <TableCell>{dayjs(order.date).format('DD/MM/YYYY')}</TableCell>
              <TableCell align="right">
                <Box sx={S.TableRowActions}>
                  {order.observations && (
                    <Tooltip
                      title={order.observations.toUpperCase()}
                      placement="left"
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={S.ObservationsText}
                      >
                        obs
                      </Typography>
                    </Tooltip>
                  )}
                  {order.invoiceId && (
                    <Tooltip title="Ver nota fiscal">
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/invoices/${order.invoiceId}`}
                      >
                        <ReceiptLong fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleOrderFormOpen(order)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteOrder(order)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  )
}
