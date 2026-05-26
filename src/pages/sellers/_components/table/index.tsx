import { DeleteDialog, Table as _Table } from '@/components'
import type { TSeller } from '@/models'

import { columns } from './columns'
import { useTableHandler } from './use-table-handler'

type TTableProps = {
  sellers: TSeller[]
  handleEdit: (seller: TSeller) => void
}

export const Table = ({ sellers, handleEdit }: TTableProps) => {
  const {
    sellerToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useTableHandler()

  return (
    <>
      <_Table
        columns={columns}
        items={sellers}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!sellerToDelete}
        title="Excluir Vendedor"
        item={sellerToDelete?.name ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
