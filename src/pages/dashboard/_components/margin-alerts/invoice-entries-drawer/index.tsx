import { Drawer } from '@mui/material'

import type { TInvoiceEntry, TMarginAlert } from '../../../utils'
import { Content } from './content'
import { Header } from './header'
import * as S from './style'

type TInvoiceEntriesDrawerProps = {
  alert: TMarginAlert | null
  entries: TInvoiceEntry[]
  handleClose: () => void
}

export const InvoiceEntriesDrawer = ({
  alert,
  entries,
  handleClose
}: TInvoiceEntriesDrawerProps) => (
  <Drawer
    anchor="right"
    open={!!alert}
    onClose={handleClose}
    slotProps={{ paper: { sx: S.Paper } }}
  >
    <Header
      alert={alert}
      entryCount={entries.length}
      handleClose={handleClose}
    />
    <Content entries={entries} />
  </Drawer>
)
