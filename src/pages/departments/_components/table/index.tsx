import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TDepartment } from '@/models'
import { useAppStore } from '@/stores'

import { columns } from './columns'

type TTableProps = {
  departments: TDepartment[]
  handleEdit: (department: TDepartment) => void
}

export const Table = ({ departments, handleEdit }: TTableProps) => {
  const { deleteDepartment } = useAppStore()
  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TDepartment>((item) => deleteDepartment(item.id))

  return (
    <>
      <_Table
        columns={columns}
        items={departments}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!itemToDelete}
        title="Excluir Departamento"
        item={itemToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
