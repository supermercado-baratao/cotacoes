import { Table as _Table } from '@/components'
import type { TSeller } from '@/models'

import { columns } from './columns'

type TTableProps = {
  sellers: TSeller[]
  handleEdit: (seller: TSeller) => void
  handleDelete: (seller: TSeller) => void
}

export const Table = ({ sellers, handleEdit, handleDelete }: TTableProps) => (
  <_Table
    columns={columns}
    items={sellers}
    handleEdit={handleEdit}
    handleDelete={handleDelete}
  />
)
