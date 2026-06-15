import { Delete } from '@mui/icons-material'
import {
  DataGrid,
  GridActionsCellItem,
  type GridRowParams
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useNavigate } from 'react-router'

import { DeleteDialog } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TInvoice } from '@/models'
import { useAppStore } from '@/stores'

import { columns } from './columns'

type TProps = {
  invoices: TInvoice[]
}

export const Table = ({ invoices }: TProps) => {
  const { deleteInvoice } = useAppStore()
  const navigate = useNavigate()

  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TInvoice>((item) => deleteInvoice(item.id))

  const handleRowClick = (params: GridRowParams<TInvoice>) => {
    navigate(`/invoices/${params.row.id}`)
  }

  const actionColumn = {
    field: 'actions',
    type: 'actions' as const,
    headerName: 'Ações',
    width: 80,
    getActions: ({ row }: { row: TInvoice }) => [
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
        rows={invoices}
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
