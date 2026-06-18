import { Add, Close } from '@mui/icons-material'
import { Box, Button, IconButton, Typography } from '@mui/material'

import type { TOrder } from '@/models'

import type { TQuoteRow } from '../../../utils'
import * as S from './style'

type THeaderProps = {
  row: TQuoteRow | null
  itemOrders: TOrder[]
  handleCloseDrawer: () => void
  handleOrderFormOpen: (order: TOrder | null) => void
}

export const Header = ({
  row,
  itemOrders,
  handleCloseDrawer,
  handleOrderFormOpen
}: THeaderProps) => {
  return (
    <Box sx={S.Header}>
      <Box sx={S.HeaderInfo}>
        <Box sx={S.HeaderInfoInner}>
          <Typography variant="h6" sx={S.HeaderTitle} noWrap>
            {row?.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {itemOrders.length === 0
              ? 'Nenhum pedido'
              : `${itemOrders.length} pedido${itemOrders.length > 1 ? 's' : ''}`}
          </Typography>
        </Box>
      </Box>
      <Box sx={S.HeaderActions}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() => handleOrderFormOpen(null)}
        >
          Novo Pedido
        </Button>
        <IconButton size="small" onClick={handleCloseDrawer}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}
