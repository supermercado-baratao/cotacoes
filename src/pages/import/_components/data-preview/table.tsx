import { type GridColDef } from '@mui/x-data-grid'

import { Table as DataTable } from '@/components'
import type { TImportData } from '@/models'
import { formatCurrency, formatNumericValue } from '@/utils'

type TTableProps = {
  importData: TImportData
  selectedIds: string[]
  handleSelectionChange: (ids: string[]) => void
}

export const Table = ({
  importData,
  selectedIds,
  handleSelectionChange
}: TTableProps) => {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID (VR)', width: 100 },
    {
      field: 'description',
      headerName: 'Descrição',
      minWidth: 260,
      flex: 1,
      valueFormatter: (value: string) => value.toUpperCase()
    },
    { field: 'department', headerName: 'Departamento', width: 150 },
    { field: 'section', headerName: 'Seção', width: 150 },
    { field: 'group', headerName: 'Grupo', width: 150 },
    {
      field: 'familyId',
      headerName: 'Família',
      width: 200,
      valueGetter: (_value, row) => {
        if (!row.familyId) return '—'
        const family = importData.families.find((f) => f.id === row.familyId)
        return family ? family.description : row.familyId
      },
      renderCell: ({ row, value }) =>
        row.familyId !== null &&
        importData.families.some((f) => f.id === row.familyId)
          ? value
          : '—'
    },
    {
      field: 'price',
      headerName: 'Preço Venda',
      width: 120,
      valueFormatter: (value: number) => formatCurrency(value)
    },
    {
      field: 'stock',
      headerName: 'Estoque',
      width: 100,
      valueFormatter: (value: number | null) =>
        value != null ? formatNumericValue(value) : '—'
    },
    {
      field: 'barcodes',
      headerName: 'Embalagens',
      width: 260,
      valueGetter: (value: string[], row) =>
        (value ?? [])
          .map(
            (barcode, i) =>
              `${barcode}${row.packTypes?.[i] ? ` (${row.packTypes[i]})` : ''}`
          )
          .join(' | ') || '—'
    },
    {
      field: 'vrCreatedAt',
      headerName: 'Cadastro VR',
      width: 120,
      valueFormatter: (value: string | null) =>
        value ? new Date(value).toLocaleDateString('pt-BR') : '—'
    }
  ]

  return (
    <DataTable
      items={importData.products}
      columns={columns}
      getRowId={(row) => row.id}
      checkboxSelection
      disableRowSelectionOnClick={false}
      rowSelectionModel={{ type: 'include', ids: new Set(selectedIds) }}
      onRowSelectionModelChange={(model) =>
        handleSelectionChange([...model.ids] as string[])
      }
    />
  )
}
