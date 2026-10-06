import { Table as _Table } from '@/components/blocks/table'
import { DeleteDialog } from '@/components/ui/dialog'
import { useDeleteHandler } from '@/hooks/use-delete-handler'
import type { TFamily } from '@/models/family-model/types'
import { useAppStore } from '@/stores/use-app-store'

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
