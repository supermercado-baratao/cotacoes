import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TSeller } from '@/models'
import { useAppStore } from '@/stores'

import { columns } from './columns'

type TTableProps = {
  sellers: TSeller[]
  handleEdit: (seller: TSeller) => void
}

export const Table = ({ sellers, handleEdit }: TTableProps) => {
  const { deleteSeller } = useAppStore()
  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TSeller>((item) => deleteSeller(item.id))

  return (
    <>
      <_Table
        columns={columns}
        items={sellers}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!itemToDelete}
        title="Excluir Vendedor"
        item={itemToDelete?.name ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
