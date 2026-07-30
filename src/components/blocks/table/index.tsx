import { Delete, Edit } from '@mui/icons-material'
import {
  DataGrid,
  type DataGridProps,
  GridActionsCellItem,
  type GridActionsCellItemProps,
  type GridColDef,
  type GridValidRowModel
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo } from 'react'

import * as S from './style'

type TTableProps<T extends GridValidRowModel> = {
  items: T[]
  columns: GridColDef<T>[]
  handleEdit?: (item: T) => void
  handleDelete?: (item: T) => void
  getExtraActions?: (item: T) => React.ReactElement<GridActionsCellItemProps>[]
} & Omit<DataGridProps<T>, 'columns' | 'rows'>

export const Table = <T extends GridValidRowModel>({
  items,
  columns,
  handleEdit,
  handleDelete,
  getExtraActions,
  ...props
}: TTableProps<T>) => {
  const actionColumn = useMemo(() => {
    if (!handleEdit && !handleDelete && !getExtraActions) return null
    return {
      field: 'actions',
      type: 'actions' as const,
      headerName: 'Ações',
      width: getExtraActions ? 130 : 90,
      getActions: ({ row }: { row: T }) => [
        ...(handleEdit
          ? [
              <GridActionsCellItem
                key="edit"
                icon={<Edit />}
                label="Editar"
                onClick={() => handleEdit(row)}
              />
            ]
          : []),
        ...(getExtraActions ? getExtraActions(row) : []),
        ...(handleDelete
          ? [
              <GridActionsCellItem
                key="delete"
                icon={<Delete />}
                label="Excluir"
                onClick={() => handleDelete(row)}
              />
            ]
          : [])
      ]
    }
  }, [handleEdit, handleDelete, getExtraActions])

  const allColumns = useMemo(
    () => (actionColumn ? [...columns, actionColumn] : columns),
    [columns, actionColumn]
  )

  return (
    <div>
      <DataGrid
        columns={allColumns}
        rows={items}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={S.Grid}
        disableRowSelectionOnClick
        autosizeOnMount
        {...props}
      />
    </div>
  )
}
