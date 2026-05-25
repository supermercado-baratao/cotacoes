import { Table as _Table } from '@/components'
import type { TFamily } from '@/models'

import { columns } from './columns'

type TTableProps = {
  families: TFamily[]
  handleEdit: (family: TFamily) => void
  handleDelete: (family: TFamily) => void
}

export const Table = ({ families, handleEdit, handleDelete }: TTableProps) => (
  <_Table
    columns={columns}
    items={families}
    handleEdit={handleEdit}
    handleDelete={handleDelete}
  />
)
