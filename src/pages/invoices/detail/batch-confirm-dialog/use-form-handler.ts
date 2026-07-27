import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

import { createSchema } from '@/components/blocks/order-form/schema'
import { getUnitPriceFromPackingPrice } from '@/components/blocks/order-form/utils'
import type { TInvoice, TOrder, TQuote, TSupplier } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'

import type { TBatchGroup } from '../../utils'

const schema = createSchema('').pick({
  sellerId: true,
  date: true,
  packing: true,
  packingQuantity: true
})

type TSchema = z.infer<typeof schema>

export const useFormHandler = (
  group: TBatchGroup | null,
  invoice: TInvoice,
  quote: TQuote,
  supplier: TSupplier,
  handleClose: () => void
) => {
  const { sellers, createOrdersBatchWithInvoiceLink } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const filteredSellers = useMemo(
    () => (sellers ?? []).filter((s) => s.supplierIds.includes(supplier.id)),
    [sellers, supplier.id]
  )

  const defaultValues: TSchema = useMemo(
    () => ({
      sellerId: null,
      date: dayjs(invoice.emissionDate).format('YYYY-MM-DD'),
      packing: group?.packing ?? '',
      packingQuantity: 1
    }),
    [invoice, group]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<TSchema>({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const watchedPackingQuantity = useWatch({ control, name: 'packingQuantity' })

  const previewRows = useMemo(
    () =>
      (group?.rows ?? []).map((row) => ({
        row,
        price: watchedPackingQuantity
          ? getUnitPriceFromPackingPrice(
              row.item.unitPrice,
              watchedPackingQuantity
            )
          : row.item.unitPrice
      })),
    [group, watchedPackingQuantity]
  )

  const onSubmit = handleSubmit((data) => {
    if (!group) return

    const matches = group.rows.map((row) => ({
      itemNumber: row.item.itemNumber,
      order: {
        quoteId: quote.id,
        quoteItemId: group.quoteItemId,
        productId: row.productId!,
        invoiceId: invoice.id,
        price: getUnitPriceFromPackingPrice(
          row.item.unitPrice,
          data.packingQuantity
        ),
        quantity: row.item.quantity,
        packing: data.packing,
        packingQuantity: data.packingQuantity,
        supplierId: supplier.id,
        sellerId: data.sellerId,
        date: data.date,
        observations: null
      } as TCreateData<TOrder>
    }))

    setSuccessCallbacks([handleClose])
    createOrdersBatchWithInvoiceLink({ invoice, matches })
  })

  return {
    register,
    onSubmit,
    errors,
    control,
    sellers: filteredSellers,
    previewRows
  }
}
