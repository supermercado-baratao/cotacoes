import {
  AddCircle,
  Block,
  Link as LinkIcon,
  ReceiptLong
} from '@mui/icons-material'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

import type { TUnmatchedProductItem } from '@/pages/products/utils'

export const buildColumns = (
  handleViewInvoice: (item: TUnmatchedProductItem) => void,
  handleCreateProduct: (item: TUnmatchedProductItem) => void,
  handleIgnoreItem: (item: TUnmatchedProductItem) => void,
  handleAssociateItem: (item: TUnmatchedProductItem) => void
): GridColDef<TUnmatchedProductItem>[] => [
  {
    field: 'description',
    headerName: 'Descrição',
    flex: 1,
    minWidth: 240,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'barcode',
    headerName: 'Cód. Barras',
    valueFormatter: (value: string | null) => value ?? '—'
  },
  {
    field: 'packageBarcode',
    headerName: 'Cód. Embalagem',
    valueFormatter: (value: string | null) => value ?? '—'
  },
  {
    field: 'supplierName',
    headerName: 'Fornecedor',
    minWidth: 200,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'occurrences',
    headerName: 'Ocorrências'
  },
  {
    field: 'lastEmissionDate',
    headerName: 'Última Ocorrência',
    valueFormatter: (value: string) => dayjs(value).format('DD/MM/YYYY')
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Ações',
    width: 170,
    getActions: ({ row }) => [
      <GridActionsCellItem
        key="view-invoice"
        icon={<ReceiptLong />}
        label="Ver nota"
        onClick={() => handleViewInvoice(row)}
      />,
      <GridActionsCellItem
        key="create-product"
        icon={<AddCircle />}
        label="Cadastrar"
        onClick={() => handleCreateProduct(row)}
      />,
      ...(row.packageBarcode
        ? [
            <GridActionsCellItem
              key="associate-product"
              icon={<LinkIcon />}
              label="Associar a produto existente"
              onClick={() => handleAssociateItem(row)}
            />
          ]
        : []),
      <GridActionsCellItem
        key="ignore"
        icon={<Block />}
        label="Ignorar"
        onClick={() => handleIgnoreItem(row)}
      />
    ]
  }
]
