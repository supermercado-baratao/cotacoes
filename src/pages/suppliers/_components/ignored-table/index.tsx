import { Table as _Table } from '@/components/blocks/table'
import type { TIgnoredSupplier } from '@/models/ignored-supplier-model/types'
import { useAppStore } from '@/stores/use-app-store'

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
