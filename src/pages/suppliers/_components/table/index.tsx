import { Table as _Table } from '@/components'
import type { TSupplier } from '@/models'

import { columns } from './columns'

type TTableProps = {
  suppliers: TSupplier[]
  handleEdit: (supplier: TSupplier) => void
  handleDelete: (supplier: TSupplier) => void
}

export const Table = ({ suppliers, handleEdit, handleDelete }: TTableProps) => (
  <_Table
    columns={columns}
    items={suppliers}
    handleEdit={handleEdit}
    handleDelete={handleDelete}
  />
)
