import { Delete, Edit } from '@mui/icons-material'
import { Box } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'

import type { TProduct } from '@/models'

import { columns } from './columns'

type TTableProps = {
  products: TProduct[]
  onEdit: (product: TProduct) => void
  onDelete: (product: TProduct) => void
}

export const Table = ({ products, onEdit, onDelete }: TTableProps) => {
  const actionColumn = {
    field: 'actions',
    type: 'actions' as const,
    headerName: 'Ações',
    width: 90,
    getActions: ({ row }: { row: TProduct }) => [
      <GridActionsCellItem
        key="edit"
        icon={<Edit />}
        label="Editar"
        onClick={() => onEdit(row)}
      />,
      <GridActionsCellItem
        key="delete"
        icon={<Delete />}
        label="Excluir"
        onClick={() => onDelete(row)}
      />
    ]
  }

  return (
    <Box>
      <DataGrid
        columns={[...columns, actionColumn]}
        rows={products}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{ textAlign: 'center' }}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
