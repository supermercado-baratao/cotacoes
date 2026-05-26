import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

import { columns } from './columns'

type TTableProps = {
  products: TProduct[]
  handleEdit: (product: TProduct) => void
}

export const Table = ({ products, handleEdit }: TTableProps) => {
  const { deleteProduct } = useAppStore()
  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TProduct>(deleteProduct)

  return (
    <>
      <_Table
        columns={columns}
        items={products}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!itemToDelete}
        title="Excluir Produto"
        item={itemToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
