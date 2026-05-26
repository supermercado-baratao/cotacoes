import { DeleteDialog, Table as _Table } from '@/components'
import type { TSupplier } from '@/models'

import { columns } from './columns'
import { useTableHandler } from './use-table-handler'

type TTableProps = {
  suppliers: TSupplier[]
  handleEdit: (supplier: TSupplier) => void
}

export const Table = ({ suppliers, handleEdit }: TTableProps) => {
  const {
    supplierToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useTableHandler()

  return (
    <>
      <_Table
        columns={columns}
        items={suppliers}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!supplierToDelete}
        title="Excluir Fornecedor"
        item={supplierToDelete?.tradeName ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
