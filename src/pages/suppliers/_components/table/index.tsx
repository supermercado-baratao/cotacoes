import { Block } from '@mui/icons-material'
import { GridActionsCellItem } from '@mui/x-data-grid'

import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TSupplier } from '@/models'
import { useAppStore } from '@/stores'
import { normalizeCnpj } from '@/utils'

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
      name: supplier.tradeName
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
