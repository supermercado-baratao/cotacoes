import { Table as _Table } from '@/components/blocks/table'
import { DeleteDialog } from '@/components/ui/dialog'
import { useDeleteHandler } from '@/hooks/use-delete-handler'
import type { TDepartment } from '@/models/department-model/types'
import { useAppStore } from '@/stores/use-app-store'

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
