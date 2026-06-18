import { Delete, ListAlt } from '@mui/icons-material'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useCallback, useMemo, useState } from 'react'

import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TQuote } from '@/models'
import { useAppStore } from '@/stores'

import type { TQuoteRow } from '../../utils'
import { columns } from './columns'
import { OrdersDrawer } from './orders-drawer'

type TTableProps = {
  quote: TQuote
  rows: TQuoteRow[]
}

export const Table = ({ quote, rows }: TTableProps) => {
  const { updateQuote } = useAppStore()
  const [drawerRow, setDrawerRow] = useState<TQuoteRow | null>(null)

  const removeFromQuote = useCallback(
    (row: TQuoteRow) => {
      updateQuote({
        ...quote,
        items: quote.items.filter((i) => i.id !== row.id)
      })
    },
    [quote, updateQuote]
  )

  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TQuoteRow>(removeFromQuote)

  const actionsColumn: GridColDef<TQuoteRow> = useMemo(
    () => ({
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="orders"
          icon={<ListAlt />}
          label="Pedidos"
          onClick={() => setDrawerRow(row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Excluir"
          onClick={() => handleDelete(row)}
        />
      ]
    }),
    [handleDelete]
  )

  return (
    <>
      <_Table columns={[...columns, actionsColumn]} items={rows} />
      <OrdersDrawer row={drawerRow} handleClose={() => setDrawerRow(null)} />
      <DeleteDialog
        open={!!itemToDelete}
        title="Remover item da cotação"
        item={itemToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
