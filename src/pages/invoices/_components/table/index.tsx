import { Delete } from '@mui/icons-material'
import {
  DataGrid,
  GridActionsCellItem,
  type GridRowParams
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { DeleteDialog } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TInvoice } from '@/models'
import { useAppStore } from '@/stores'
import { findSupplierByCnpj } from '@/utils'

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
    width: 80,
    getActions: ({ row }: { row: TInvoiceRow }) => [
      <GridActionsCellItem
        key="delete"
        icon={<Delete />}
        label="Excluir"
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row)
        }}
      />
    ]
  }

  return (
    <>
      <DataGrid
        columns={[...columns, actionColumn]}
        rows={rows}
        onRowClick={handleRowClick}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        disableRowSelectionOnClick
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
