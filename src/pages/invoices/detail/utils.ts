import { matchesSearch } from '@/utils'

import type { TInvoiceItemRow } from './use-invoice-detail-handler'

export const filterInvoiceItemRows = (
  search: string,
  rows: TInvoiceItemRow[]
): TInvoiceItemRow[] =>
  rows.filter((row) =>
    matchesSearch(
      search,
      row.description,
      row.productDescription,
      row.barcode,
      row.calculatedBarcode,
      row.packageBarcode,
      row.supplierProductCode,
      row.productId
    )
  )
