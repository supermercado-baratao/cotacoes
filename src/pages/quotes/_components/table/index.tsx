import { Delete, History, ListAlt } from '@mui/icons-material'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useCallback, useMemo, useState } from 'react'

import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TQuote } from '@/models'
import { useAppStore } from '@/stores'

import type { TQuoteRow } from '../../utils'
import { columns } from './columns'
import { HistoryDrawer } from './history-drawer'
import { OrdersDrawer } from './orders-drawer'

type TTableProps = {
  quote: TQuote
  rows: TQuoteRow[]
}

export const Table = ({ quote, rows }: TTableProps) => {
  const { updateQuote, setHistoryProductId } = useAppStore()
  const [drawerRow, setDrawerRow] = useState<TQuoteRow | null>(null)
  const [historyRow, setHistoryRow] = useState<TQuoteRow | null>(null)

  const handleHistoryOpen = useCallback(
    (row: TQuoteRow) => {
      setHistoryRow(row)
      setHistoryProductId(row.id)
    },
    [setHistoryProductId]
  )

  const handleHistoryClose = () => {
    setHistoryRow(null)
    setHistoryProductId(null)
  }

  const removeFromQuote = (row: TQuoteRow) => {
    updateQuote({
      ...quote,
      items: quote.items.filter((i) => i.id !== row.id)
    })
  }

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
      width: 120,
      getActions: ({ row }) => [
        ...(row.type === 'product'
          ? [
              <GridActionsCellItem
                key="history"
                icon={<History />}
                label="Histórico"
                onClick={() => handleHistoryOpen(row)}
              />
            ]
          : []),
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
    [handleDelete, handleHistoryOpen]
  )

  return (
    <>
      <_Table columns={[...columns, actionsColumn]} items={rows} />
      <OrdersDrawer row={drawerRow} handleClose={() => setDrawerRow(null)} />
      <HistoryDrawer
        productId={historyRow?.id ?? null}
        productName={historyRow?.description ?? null}
        handleClose={handleHistoryClose}
      />
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
