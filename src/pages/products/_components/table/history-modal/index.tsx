import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { Modal } from '@/components'
import type { TProduct, TProductHistoryType } from '@/models'

import { useHistoryHandler } from './use-history-handler'

type THistoryModalProps = {
  product: TProduct | null
  field: TProductHistoryType | null
  handleClose: () => void
}

export const HistoryModal = ({
  product,
  field,
  handleClose
}: THistoryModalProps) => {
  const { title, items } = useHistoryHandler({ field })

  return (
    <Modal
      isOpened={product !== null && field !== null}
      title={{
        component: (
          <Typography component="h3" variant="h5">
            {title}
          </Typography>
        )
      }}
      handleClose={handleClose}
    >
      <Typography sx={{ mb: 1 }}>{product?.description}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell align="right">Valor Anterior</TableCell>
              <TableCell align="right">Novo Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.date}</TableCell>
                <TableCell align="right">{item.oldValue}</TableCell>
                <TableCell align="right">{item.newValue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Modal>
  )
}
