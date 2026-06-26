import type { GridColDef } from '@mui/x-data-grid'

import type { TProduct } from '@/models'
import { formatCurrency, formatNumericValue } from '@/utils'

export const columns: GridColDef<TProduct>[] = [
  {
    field: 'id',
    headerName: 'Cód. VR',
    width: 90
  },
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 240,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'department',
    headerName: 'Departamento',
    width: 140,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? '—'
  },
  {
    field: 'section',
    headerName: 'Seção',
    width: 140,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? '—'
  },
  {
    field: 'group',
    headerName: 'Grupo',
    width: 140,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? '—'
  },
  {
    field: 'price',
    headerName: 'Preço',
    width: 110,
    valueFormatter: (value: number | null) => formatCurrency(value ?? 0)
  },
  {
    field: 'margin',
    headerName: 'Margem Padrão',
    width: 110,
    valueFormatter: (value: number | null) =>
      value != null ? `${value.toFixed(1)}%` : '—'
  },

  {
    field: 'stock',
    headerName: 'Estoque',
    width: 90,
    valueFormatter: (value: number | null) =>
      value != null ? formatNumericValue(value) : '—'
  },
  {
    field: 'barcodes',
    headerName: 'Embalagens',
    width: 260,
    valueGetter: (value: string[], row: TProduct) =>
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
  },
  {
    field: 'observations',
    headerName: 'Observações',
    minWidth: 160,
    flex: 1,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? ''
  }
]
