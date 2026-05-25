import { Table as _Table } from '@/components'
import type { TProduct } from '@/models'

import { columns } from './columns'

type TTableProps = {
  products: TProduct[]
  handleEdit: (product: TProduct) => void
  handleDelete: (product: TProduct) => void
}

export const Table = ({ products, handleEdit, handleDelete }: TTableProps) => (
  <_Table
    columns={columns}
    items={products}
    handleEdit={handleEdit}
    handleDelete={handleDelete}
  />
)
