import { Delete, Edit } from '@mui/icons-material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo } from 'react'

import type { TProduct } from '@/models'

import { columns } from './columns'

type TTableProps = {
  products: TProduct[]
  handleEdit: (product: TProduct) => void
  handleDelete: (product: TProduct) => void
}

export const Table = ({ products, handleEdit, handleDelete }: TTableProps) => {
  const actionColumn = useMemo(
    () => ({
      field: 'actions',
      type: 'actions' as const,
      headerName: 'Ações',
      width: 90,
      getActions: ({ row }: { row: TProduct }) => [
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
    [handleEdit, handleDelete]
  )

  return (
    <div>
      <DataGrid
        columns={[...columns, actionColumn]}
        rows={products}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{ textAlign: 'center' }}
        disableRowSelectionOnClick
      />
    </div>
  )
}
