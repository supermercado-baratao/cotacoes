import { Category } from '@mui/icons-material'
import { type GridColDef } from '@mui/x-data-grid'

import { Table as DataTable } from '@/components'
import type { TImportData } from '@/models'
import { formatCurrency } from '@/utils'

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
    { field: 'description', headerName: 'Descrição', flex: 1 },
    {
      field: 'familyId',
      headerName: 'Família',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) =>
        row.familyId !== null &&
        importData.families.some((f) => f.id === row.familyId) ? (
          <Category fontSize="small" color="action" />
        ) : null
    },
    {
      field: 'price',
      headerName: 'Preço',
      width: 120,
      valueFormatter: (value: number) => formatCurrency(value)
    },
    {
      field: 'supplierIds',
      headerName: 'Fornecedores',
      flex: 1,
      valueGetter: (value: string[]) =>
        value
          .map((id) => {
            const supplier = importData.suppliers.find((s) => s.id === id)
            if (!supplier) return id
            return supplier.tradeName || supplier.legalName
          })
          .join(', ')
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
