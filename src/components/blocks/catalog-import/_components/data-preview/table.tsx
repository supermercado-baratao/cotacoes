import { Chip } from '@mui/material'
import { type GridColDef } from '@mui/x-data-grid'

import { Table as DataTable } from '@/components/blocks/table'
import type { TImportData } from '@/models/import-model/types'
import { formatCurrency, formatNumericValue } from '@/utils/formatters'

import type { TProductImportStatus } from '../../utils'

type TTableProps = {
  importData: TImportData
  selectedIds: string[]
  handleSelectionChange: (ids: string[]) => void
  productStatuses: Map<string, TProductImportStatus>
}

const STATUS_LABEL: Record<TProductImportStatus, string> = {
  new: 'Novo',
  changed: 'Alterado',
  unchanged: 'Sem alteração'
}

const STATUS_COLOR: Record<
  TProductImportStatus,
  'success' | 'warning' | 'default'
> = {
  new: 'success',
  changed: 'warning',
  unchanged: 'default'
}

export const Table = ({
  importData,
  selectedIds,
  handleSelectionChange,
  productStatuses
}: TTableProps) => {
  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'Status',
      valueGetter: (_value, row) => productStatuses.get(row.id) ?? 'new',
      renderCell: ({ value }) => {
        const status = (value ?? 'new') as TProductImportStatus
        return (
          <Chip
            label={STATUS_LABEL[status]}
            color={STATUS_COLOR[status]}
            size="small"
          />
        )
      }
    },
    { field: 'id', headerName: 'ID (VR)' },
    {
      field: 'description',
      headerName: 'Descrição',
      minWidth: 260,
      flex: 1,
      valueFormatter: (value: string) => value.toUpperCase()
    },
    { field: 'department', headerName: 'Departamento' },
    { field: 'section', headerName: 'Seção' },
    { field: 'group', headerName: 'Grupo' },
    {
      field: 'familyId',
      headerName: 'Família',
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
      valueFormatter: (value: number) => formatCurrency(value)
    },
    {
      field: 'stock',
      headerName: 'Estoque',
      valueFormatter: (value: number | null) =>
        value != null ? formatNumericValue(value) : '—'
    },
    {
      field: 'barcodes',
      headerName: 'Embalagens',
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
