import { Delete } from '@mui/icons-material'
import { GridActionsCellItem, type GridRowParams } from '@mui/x-data-grid'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { Table as _Table } from '@/components/blocks/table'
import { DeleteDialog } from '@/components/ui/dialog'
import { useDeleteHandler } from '@/hooks/use-delete-handler'
import type { TInvoice } from '@/models/invoice-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { findSupplierByCnpj } from '@/utils/suppliers'

import { columns, type TInvoiceRow } from './columns'

type TProps = {
  invoices: TInvoice[]
}

export const Table = ({ invoices }: TProps) => {
  const { suppliers, deleteInvoice } = useAppStore()
  const navigate = useNavigate()

  const rows = useMemo(
    (): TInvoiceRow[] =>
      invoices.map((invoice) => ({
        ...invoice,
        isSupplierRegistered: !!findSupplierByCnpj(
          invoice.supplierCnpj,
          suppliers ?? []
        )
      })),
    [invoices, suppliers]
  )

  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TInvoiceRow>((item) => deleteInvoice(item.id))

  const handleRowClick = (params: GridRowParams<TInvoiceRow>) => {
    navigate(`/invoices/${params.row.id}`)
  }

  const actionColumn = {
    field: 'actions',
    type: 'actions' as const,
    headerName: 'Ações',
    getActions: ({ row }: { row: TInvoiceRow }) => [
      <GridActionsCellItem
        key="delete"
        icon={<Delete />}
        label="Excluir"
        onClick={(event) => {
          event.stopPropagation()
          handleDelete(row)
        }}
      />
    ]
  }

  return (
    <>
      <_Table
        columns={[...columns, actionColumn]}
        items={rows}
        onRowClick={handleRowClick}
        sx={{ textAlign: 'center', cursor: 'pointer' }}
      />
      <DeleteDialog
        open={!!itemToDelete}
        title="Excluir Nota"
        item={`NF nº ${itemToDelete?.number ?? ''}`}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
