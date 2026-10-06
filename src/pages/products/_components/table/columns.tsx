import { Chip } from '@mui/material'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import { formatCurrency, formatNumericValue } from '@/utils/formatters'
import { marginStatusConfig } from '@/utils/margin'

import type { TProductRow } from '../../utils'

const renderMarginStatus = ({ row }: GridRenderCellParams<TProductRow>) =>
  row.marginStatus ? (
    <Chip
      label={marginStatusConfig[row.marginStatus].label}
      color={marginStatusConfig[row.marginStatus].color}
      size="small"
    />
  ) : (
    '—'
  )

export const columns: GridColDef<TProductRow>[] = [
  {
    field: 'id',
    headerName: 'Cód. VR'
  },
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 240,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'price',
    headerName: 'Preço',
    valueFormatter: (value: number | null) => formatCurrency(value ?? 0)
  },
  {
    field: 'margin',
    headerName: 'Margem Padrão',
    valueFormatter: (value: number | null) =>
      value != null ? `${value.toFixed(1)}%` : '—'
  },
  {
    field: 'marginStatus',
    headerName: 'Situação de Margem',
    minWidth: 160,
    renderCell: renderMarginStatus
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
    valueGetter: (value: string[], row: TProductRow) =>
      (value ?? [])
        .map(
          (barcode, i) =>
            `${barcode}${row.packTypes?.[i] ? ` (${row.packTypes[i]})` : ''}`
        )
        .join(' | ') || '—'
  },
  {
    field: 'department',
    headerName: 'Departamento',
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? '—'
  },
  {
    field: 'section',
    headerName: 'Seção',
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? '—'
  },
  {
    field: 'group',
    headerName: 'Grupo',
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? '—'
  },
  {
    field: 'vrCreatedAt',
    headerName: 'Cadastro VR',
    valueFormatter: (value: string | null) =>
      value ? new Date(value).toLocaleDateString('pt-BR') : '—'
  },
  {
    field: 'observations',
    headerName: 'Observações',
    minWidth: 160,
    flex: 1,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? ''
  }
]
