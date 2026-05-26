import { Delete, Edit } from '@mui/icons-material'
import {
  DataGrid,
  type DataGridProps,
  GridActionsCellItem,
  type GridColDef,
  type GridValidRowModel
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo } from 'react'

import * as S from './style'

type TTableProps<T extends GridValidRowModel> = {
  items: T[]
  columns: GridColDef<T>[]
  handleEdit: (item: T) => void
  handleDelete: (item: T) => void
} & Omit<DataGridProps<T>, 'columns' | 'rows'>

export const Table = <T extends GridValidRowModel>({
  items,
  columns,
  handleEdit,
  handleDelete,
  ...props
}: TTableProps<T>) => {
  const actionColumn = useMemo(
    () => ({
      field: 'actions',
      type: 'actions' as const,
      headerName: 'Ações',
      width: 90,
      getActions: ({ row }: { row: T }) => [
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
        rows={items}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={S.Grid}
        disableRowSelectionOnClick
        {...props}
      />
    </div>
  )
}
