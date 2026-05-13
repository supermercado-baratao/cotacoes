import { Delete, Edit } from '@mui/icons-material'
import { Box } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo } from 'react'

import type { TFamily } from '@/models'

import { columns } from './columns'

type TTableProps = {
  families: TFamily[]
  onEdit: (family: TFamily) => void
  onDelete: (family: TFamily) => void
}

export const Table = ({ families, onEdit, onDelete }: TTableProps) => {
  const actionColumn = useMemo(
    () => ({
      field: 'actions',
      type: 'actions' as const,
      headerName: 'Ações',
      width: 90,
      getActions: ({ row }: { row: TFamily }) => [
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
        rows={families}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{ textAlign: 'center' }}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
