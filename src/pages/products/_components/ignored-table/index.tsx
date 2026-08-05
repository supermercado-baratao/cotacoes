import { Delete } from '@mui/icons-material'
import { GridActionsCellItem } from '@mui/x-data-grid'

import { Table as _Table } from '@/components'
import { useAppStore } from '@/stores'

import type { TIgnoredProductRow } from '../../utils'
import { columns } from './columns'

type TIgnoredTableProps = {
  items: TIgnoredProductRow[]
}

export const IgnoredTable = ({ items }: TIgnoredTableProps) => {
  const { deleteIgnoredProduct } = useAppStore()

  return (
    <_Table
      columns={columns}
      items={items}
      getExtraActions={(row) =>
        row.removable
          ? [
              <GridActionsCellItem
                key="remove"
                icon={<Delete />}
                label="Remover"
                onClick={() => deleteIgnoredProduct(row.id)}
              />
            ]
          : []
      }
    />
  )
}
