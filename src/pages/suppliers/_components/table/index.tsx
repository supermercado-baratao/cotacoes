import { Delete, Edit } from '@mui/icons-material'
import { Box } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo } from 'react'

import type { TSupplier } from '@/models'

import { columns } from './columns'

type TTableProps = {
  suppliers: TSupplier[]
  onEdit: (supplier: TSupplier) => void
  onDelete: (supplier: TSupplier) => void
}

export const Table = ({ suppliers, onEdit, onDelete }: TTableProps) => {
  const actionColumn = useMemo(
    () => ({
      field: 'actions',
      type: 'actions' as const,
      headerName: 'Ações',
      width: 90,
      getActions: ({ row }: { row: TSupplier }) => [
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
    }),
    [onEdit, onDelete]
  )

  return (
    <Box>
      <DataGrid
        columns={[...columns, actionColumn]}
        rows={suppliers}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{ textAlign: 'center' }}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
