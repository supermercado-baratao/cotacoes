import { useMemo, useState } from 'react'

import { OrderForm } from '@/components/blocks/order-form'
import type { TInvoice } from '@/models/invoice/types'
import type { TOrder } from '@/models/order/types'
import type { TQuote } from '@/models/quote/types'

type TEditOrderDialogProps = {
  invoice: TInvoice
  quote: TQuote
  itemNumber: number
  order: TOrder
  handleClose: () => void
}

export const EditOrderDialog = ({
  invoice,
  quote,
  itemNumber,
  order,
  handleClose
}: TEditOrderDialogProps) => {
  const [quoteItemId, setQuoteItemId] = useState(order.quoteItemId)

  const quoteItemOptions = useMemo(
    () =>
      quote.items.toSorted((a, b) =>
        a.description.localeCompare(b.description)
      ),
    [quote]
  )

  const quoteItem = quoteItemOptions.find((qi) => qi.id === quoteItemId) ?? null

  return (
    <OrderForm
      isOpened
      quoteItem={quoteItem}
      quoteItemOptions={quoteItemOptions}
      handleQuoteItemChange={setQuoteItemId}
      order={order}
      setFormOrder={() => {}}
      invoiceRef={{ invoice, itemNumber }}
      handleClose={handleClose}
    />
  )
}
