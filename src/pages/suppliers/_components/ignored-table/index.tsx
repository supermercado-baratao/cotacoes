import { Table as _Table } from '@/components'
import type { TIgnoredSupplier } from '@/models'
import { useAppStore } from '@/stores'

import { columns } from './columns'

type TIgnoredTableProps = {
  ignoredSuppliers: TIgnoredSupplier[]
}

export const IgnoredTable = ({ ignoredSuppliers }: TIgnoredTableProps) => {
  const { deleteIgnoredSupplier } = useAppStore()

  return (
    <_Table
      columns={columns}
      items={ignoredSuppliers}
      handleDelete={(ignoredSupplier) =>
        deleteIgnoredSupplier(ignoredSupplier.id)
      }
    />
  )
}
