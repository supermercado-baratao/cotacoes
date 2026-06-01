import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TSupplier } from '@/models'
import { useAppStore } from '@/stores'

import { columns } from './columns'

type TTableProps = {
  suppliers: TSupplier[]
  handleEdit: (supplier: TSupplier) => void
}

export const Table = ({ suppliers, handleEdit }: TTableProps) => {
  const { deleteSupplier } = useAppStore()
  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TSupplier>((item) => deleteSupplier(item.id))

  return (
    <>
      <_Table
        columns={columns}
        items={suppliers}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
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
