import { DeleteDialog, Table as _Table } from '@/components'
import type { TFamily } from '@/models'

import { columns } from './columns'
import { useTableHandler } from './use-table-handler'

type TTableProps = {
  families: TFamily[]
  handleEdit: (family: TFamily) => void
}

export const Table = ({ families, handleEdit }: TTableProps) => {
  const {
    familyToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useTableHandler()

  return (
    <>
      <_Table
        columns={columns}
        items={families}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!familyToDelete}
        title="Excluir Família"
        item={familyToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
