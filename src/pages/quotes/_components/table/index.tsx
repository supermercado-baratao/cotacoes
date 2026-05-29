import { useState } from 'react'

import { DeleteDialog, Table as _Table } from '@/components'
import type { TQuote } from '@/models'
import { useAppStore } from '@/stores'

import type { TQuoteRow } from '../../utils'
import { columns } from './columns'

type TTableProps = {
  quote: TQuote
  rows: TQuoteRow[]
  handleEdit: (row: TQuoteRow) => void
}

export const Table = ({ quote, rows, handleEdit }: TTableProps) => {
  const { updateQuote, deleteOrder } = useAppStore()

  const [rowToDelete, setRowToDelete] = useState<TQuoteRow | null>(null)

  const removeFromQuote = (productId: string, orderId: string | null) => {
    updateQuote({
      ...quote,
      products: quote.products.filter((id) => id !== productId)
    })
    if (orderId) deleteOrder(orderId)
  }

  const handleDelete = (row: TQuoteRow) => setRowToDelete(row)

  const handleDeleteDialogClose = () => setRowToDelete(null)

  const handleDeleteDialogConfirm = () => {
    if (!rowToDelete) return
    removeFromQuote(rowToDelete.id, rowToDelete.orderId)
    setRowToDelete(null)
  }

  return (
    <>
      <_Table
        columns={columns}
        items={rows}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!rowToDelete}
        title="Remover produto da cotação"
        item={rowToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
