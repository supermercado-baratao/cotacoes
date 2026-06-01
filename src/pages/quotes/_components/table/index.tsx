import { Delete, Edit, History } from '@mui/icons-material'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useMemo, useState } from 'react'

import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TQuote } from '@/models'
import { useAppStore } from '@/stores'

import type { TQuoteRow } from '../../utils'
import { columns } from './columns'
import { HistoryDrawer } from './history-drawer'

type TDrawerState = {
  productId: string
  productName: string
}

type TTableProps = {
  quote: TQuote
  rows: TQuoteRow[]
  handleEdit: (row: TQuoteRow) => void
}

export const Table = ({ quote, rows, handleEdit }: TTableProps) => {
  const { updateQuote, deleteOrder, setHistoryProductId } = useAppStore()
  const [drawer, setDrawer] = useState<TDrawerState | null>(null)

  const removeFromQuote = (row: TQuoteRow) => {
    updateQuote({
      ...quote,
      products: quote.products.filter((id) => id !== row.id)
    })
    if (row.orderId) deleteOrder(row.orderId)
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
        <GridActionsCellItem
          key="history"
          icon={<History />}
          label="Histórico"
          onClick={() => {
            setDrawer({ productId: row.id, productName: row.description })
            setHistoryProductId(row.id)
          }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Editar"
          onClick={() => handleEdit(row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Excluir"
          onClick={() => handleDelete(row)}
        />
      ]
    }),
    [handleEdit, handleDelete, setHistoryProductId]
  )

  return (
    <>
      <_Table columns={[...columns, actionsColumn]} items={rows} />
      <HistoryDrawer
        productId={drawer?.productId ?? null}
        productName={drawer?.productName ?? null}
        onClose={() => {
          setDrawer(null)
          setHistoryProductId(null)
        }}
      />
      <DeleteDialog
        open={!!itemToDelete}
        title="Remover produto da cotação"
        item={itemToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
