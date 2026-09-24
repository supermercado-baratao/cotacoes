import { Block } from '@mui/icons-material'
import { GridActionsCellItem } from '@mui/x-data-grid'

import { DeleteDialog, Table as _Table } from '@/components'
import { useDeleteHandler } from '@/hooks'
import type { TProduct } from '@/models'
import { useAppStore } from '@/stores'

import type { TProductRow } from '../../utils'
import { columns } from './columns'

type TTableProps = {
  products: TProductRow[]
  handleEdit: (product: TProduct) => void
}

export const Table = ({ products, handleEdit }: TTableProps) => {
  const { deleteProduct, createIgnoredProduct } = useAppStore()
  const {
    itemToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TProduct>((item) => deleteProduct(item.id))

  const handleIgnore = (product: TProduct) =>
    createIgnoredProduct({
      id: product.id,
      barcode: product.barcodes[0] ?? null,
      description: product.description
    })

  return (
    <>
      <_Table
        columns={columns}
        items={products}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        getExtraActions={(product) => [
          <GridActionsCellItem
            key="ignore"
            icon={<Block />}
            label="Ignorar"
            onClick={() => handleIgnore(product)}
          />
        ]}
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
