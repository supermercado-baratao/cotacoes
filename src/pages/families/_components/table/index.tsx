import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TFamily } from '@/models'
import { useAppStore } from '@/stores'

import { columns } from './columns'

type TTableProps = {
  families: TFamily[]
  handleEdit: (family: TFamily) => void
}

export const Table = ({ families, handleEdit }: TTableProps) => {
  const { deleteFamily } = useAppStore()
  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TFamily>((item) => deleteFamily(item.id))

  return (
    <>
      <_Table
        columns={columns}
        items={families}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!itemToDelete}
        title="Excluir Família"
        item={itemToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
