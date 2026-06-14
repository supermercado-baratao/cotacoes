import { Category } from '@mui/icons-material'
import {
  Checkbox,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import type { TImportData } from '@/models'
import { formatCurrency } from '@/utils'

type TDataPreviewProps = {
  importData: TImportData
  selectedIds: string[]
  handleSelectionChange: (ids: string[]) => void
}

export const Table = ({
  importData,
  selectedIds,
  handleSelectionChange
}: TDataPreviewProps) => {
  const allSelected = selectedIds.length === importData.products.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const handleToggleAll = () =>
    handleSelectionChange(
      allSelected ? [] : importData.products.map((p) => p.vrId)
    )

  const handleToggleRow = (vrId: string) =>
    handleSelectionChange(
      selectedIds.includes(vrId)
        ? selectedIds.filter((id) => id !== vrId)
        : [...selectedIds, vrId]
    )

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
        {selectedIds.length} de {importData.products.length} produtos
        selecionados
      </Typography>
      <MuiTable size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleToggleAll}
              />
            </TableCell>
            <TableCell>ID (VR)</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Família</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Fornecedor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {importData.products.map((row) => {
            const isSelected = selectedIds.includes(row.vrId)
            return (
              <TableRow
                key={row.vrId}
                selected={isSelected}
                onClick={() => handleToggleRow(row.vrId)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell
                  padding="checkbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggleRow(row.vrId)}
                  />
                </TableCell>
                <TableCell>{row.vrId}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>
                  {row.familyId !== null &&
                    importData.families.some(
                      (f) => f.vrId === row.familyId
                    ) && <Category fontSize="small" color="action" />}
                </TableCell>
                <TableCell>{formatCurrency(row.price)}</TableCell>
                <TableCell>
                  {row.supplierIds
                    .map(
                      (id) =>
                        importData.suppliers.find((s) => s.vrId === id)
                          ?.tradeName ?? id
                    )
                    .join(', ')}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </MuiTable>
    </TableContainer>
  )
}
