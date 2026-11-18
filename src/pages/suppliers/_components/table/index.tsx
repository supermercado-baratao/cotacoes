import { Block } from '@mui/icons-material'
import { GridActionsCellItem } from '@mui/x-data-grid'

import { Table as _Table } from '@/components/blocks/table'
import { DeleteDialog } from '@/components/ui/dialog'
import { useDeleteHandler } from '@/hooks/use-delete-handler'
import type { TSupplier } from '@/models/supplier/types'
import { useAppStore } from '@/stores/use-app-store'
import { normalizeCnpj } from '@/utils/formatters'

import { columns } from './columns'

type TTableProps = {
  suppliers: TSupplier[]
  handleEdit: (supplier: TSupplier) => void
}

export const Table = ({ suppliers, handleEdit }: TTableProps) => {
  const { deleteSupplier, createIgnoredSupplier } = useAppStore()
  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TSupplier>((item) => deleteSupplier(item.id))

  const handleIgnore = (supplier: TSupplier) =>
    createIgnoredSupplier({
      id: normalizeCnpj(supplier.cnpj),
      cnpj: supplier.cnpj,
      name: supplier.tradeName ?? supplier.legalName
    })

  return (
    <>
      <_Table
        columns={columns}
        items={suppliers}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        getExtraActions={(supplier) => [
          <GridActionsCellItem
            key="ignore"
            icon={<Block />}
            label="Ignorar"
            onClick={() => handleIgnore(supplier)}
          />
        ]}
      />
      <DeleteDialog
        open={!!itemToDelete}
        title="Excluir Fornecedor"
        item={itemToDelete?.tradeName ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
