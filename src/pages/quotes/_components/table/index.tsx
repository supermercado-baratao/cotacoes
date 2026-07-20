import { AddLink, Delete, ListAlt } from '@mui/icons-material'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useCallback, useMemo, useState } from 'react'

import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TQuote, TQuoteItem } from '@/models'
import { useAppStore } from '@/stores'

import type { TQuoteRow } from '../../utils'
import { columns } from './columns'
import { OrdersDrawer } from './orders-drawer'
import { ProductReferenceForm } from './product-reference-form'

type TTableProps = {
  quote: TQuote
  rows: TQuoteRow[]
}

export const Table = ({ quote, rows }: TTableProps) => {
  const { updateQuote, ordersByQuoteId } = useAppStore()
  const [drawerRow, setDrawerRow] = useState<TQuoteRow | null>(null)
  const [salePriceItem, setSalePriceItem] = useState<TQuoteItem | null>(null)

  const removeFromQuote = useCallback(
    (row: TQuoteRow) => {
      const ordersToDelete = (ordersByQuoteId ?? []).filter(
        (o) => o.quoteItemId === row.id
      )
      updateQuote(
        {
          ...quote,
          items: quote.items.filter((i) => i.id !== row.id)
        },
        ordersToDelete
      )
    },
    [quote, updateQuote, ordersByQuoteId]
  )

  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TQuoteRow>(removeFromQuote)

  const handleSalePriceOpen = useCallback(
    (row: TQuoteRow) => {
      const item = quote.items.find((i) => i.id === row.id) ?? null
      setSalePriceItem(item)
    },
    [quote.items]
  )

  const actionsColumn: GridColDef<TQuoteRow> = useMemo(
    () => ({
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="sale-price"
          icon={<AddLink />}
          label="Referenciar"
          onClick={() => handleSalePriceOpen(row)}
        />,
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
    [handleDelete, handleSalePriceOpen]
  )

  return (
    <>
      <_Table columns={[...columns, actionsColumn]} items={rows} />
      <OrdersDrawer row={drawerRow} handleClose={() => setDrawerRow(null)} />
      <ProductReferenceForm
        isOpened={!!salePriceItem}
        quoteItem={salePriceItem}
        quote={quote}
        handleClose={() => setSalePriceItem(null)}
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
