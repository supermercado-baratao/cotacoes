import { useNavigate } from 'react-router'

import { Table as _Table } from '@/components'

import type { TUnmatchedProductItem } from '../../utils'
import { buildColumns } from './columns'

type TUnmatchedTableProps = {
  items: TUnmatchedProductItem[]
  handleCreateProduct: (item: TUnmatchedProductItem) => void
}

export const UnmatchedTable = ({
  items,
  handleCreateProduct
}: TUnmatchedTableProps) => {
  const navigate = useNavigate()

  const handleViewInvoice = (item: TUnmatchedProductItem) =>
    navigate(`/invoices/${item.lastInvoiceId}`)

  const columns = buildColumns(handleViewInvoice, handleCreateProduct)

  return <_Table columns={columns} items={items} getRowId={(row) => row.key} />
}
