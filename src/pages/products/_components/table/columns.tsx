import type { GridColDef } from '@mui/x-data-grid'

import type { TProduct, TProductHistoryType } from '@/models'
import { formatCurrency, formatNumericValue } from '@/utils'

import { calcSuggestedPrice } from '../../utils'
import { HistoryCell } from './history-cell'

export const getColumns = (
  handleHistoryClick: (product: TProduct, field: TProductHistoryType) => void
): GridColDef<TProduct>[] => [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'price',
    headerName: 'Preço',
    minWidth: 160,
    renderCell: ({ row }) => (
      <HistoryCell
        currentValue={row.price}
        lastValue={row.lastPrice}
        formatValue={formatCurrency}
        handleClick={() => handleHistoryClick(row, 'price')}
      />
    )
  },
  {
    field: 'purchasePrice',
    headerName: 'Custo',
    minWidth: 160,
    renderCell: ({ row }) => (
      <HistoryCell
        currentValue={row.purchasePrice}
        lastValue={row.lastPurchasePrice}
        formatValue={formatCurrency}
        handleClick={() => handleHistoryClick(row, 'purchasePrice')}
      />
    )
  },
  {
    field: 'quantity',
    headerName: 'Qtd.',
    minWidth: 120,
    renderCell: ({ row }) => (
      <HistoryCell
        currentValue={row.quantity}
        lastValue={row.lastQuantity}
        formatValue={formatNumericValue}
        handleClick={() => handleHistoryClick(row, 'quantity')}
      />
    )
  },
  {
    field: 'packaging',
    headerName: 'Emb.',
    valueFormatter: (value: string | null) => value?.toUpperCase()
  },
  {
    field: 'supplierIds',
    headerName: 'Fornecedores',
    width: 130,
    valueGetter: (_: never, row: TProduct) => row.supplierIds?.length ?? 0,
    valueFormatter: (value: number) =>
      value === 1 ? '1 fornecedor' : `${value} fornecedores`
  },
  {
    field: 'suggestedPrice',
    headerName: 'Sugerido',
    valueGetter: (_: never, row: TProduct) => calcSuggestedPrice(row),
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'observation',
    headerName: 'Observações',
    minWidth: 180,
    flex: 1,
    valueFormatter: (value: string | null) => value?.toUpperCase()
  }
]
