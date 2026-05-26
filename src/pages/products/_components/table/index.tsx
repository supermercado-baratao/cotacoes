import { DeleteDialog, Table as _Table } from '@/components'
import type { TProduct } from '@/models'

import { columns } from './columns'
import { useTableHandler } from './use-table-handler'

type TTableProps = {
  products: TProduct[]
  handleEdit: (product: TProduct) => void
}

export const Table = ({ products, handleEdit }: TTableProps) => {
  const {
    productToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useTableHandler()

  return (
    <>
      <_Table
        columns={columns}
        items={products}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <DeleteDialog
        open={!!productToDelete}
        title="Excluir Produto"
        item={productToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
