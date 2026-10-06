import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

import { createSchema } from '@/components/blocks/order-form/schema'
import {
  extractPackingInfo,
  getUnitPriceFromPackingPrice
} from '@/components/blocks/order-form/utils'
import type { TInvoice } from '@/models/invoice-model/types'
import type { TOrder } from '@/models/order-model/types'
import type { TQuote } from '@/models/quote-model/types'
import type { TSeller } from '@/models/seller-model/types'
import type { TSupplier } from '@/models/supplier-model/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import type { TCreateData } from '@/types/generics'
import { findGroupPackingDefault } from '@/utils/packing-defaults'

import type { TBatchGroup } from '../../utils'

const schema = createSchema('').pick({
  sellerId: true,
  date: true,
  packing: true,
  packingQuantity: true,
  observations: true
})

type TSchema = z.infer<typeof schema>

export const useFormHandler = (
  group: TBatchGroup | null,
  invoice: TInvoice,
  quote: TQuote,
  supplier: TSupplier,
  handleClose: () => void
) => {
  const {
    sellers,
    products,
    packingDefaults,
    createOrdersBatchWithInvoiceLink,
    upsertPackingDefault
  } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const filteredSellers = useMemo(
    () => (sellers ?? []).filter((s) => s.supplierIds.includes(supplier.id)),
    [sellers, supplier.id]
  )

  const productIds = useMemo(
    () => (group?.rows ?? []).map((row) => row.productId!),
    [group]
  )

  const defaultValues: TSchema = useMemo(() => {
    const extractedPacking = group ? extractPackingInfo(group.packing) : null
    const savedPackingQuantity =
      group &&
      findGroupPackingDefault(
        packingDefaults ?? [],
        supplier.id,
        productIds,
        group.packing
      )

    return {
      sellerId: null,
      date: dayjs(invoice.emissionDate).format('YYYY-MM-DD'),
      packing: extractedPacking?.packing ?? group?.packing ?? '',
      packingQuantity:
        savedPackingQuantity ?? extractedPacking?.packingQuantity ?? 1,
      observations: null
    }
  }, [invoice, group, supplier.id, productIds, packingDefaults])

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors }
  } = useForm<TSchema>({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const watchedPackingQuantity = useWatch({ control, name: 'packingQuantity' })

  const previewRows = useMemo(
    () =>
      (group?.rows ?? []).map((row) => {
        const price = watchedPackingQuantity
          ? getUnitPriceFromPackingPrice(
              row.item.unitPrice,
              watchedPackingQuantity
            )
          : row.item.unitPrice
        const salePrice =
          products?.find((p) => p.id === row.productId)?.price ?? null
        const margin =
          salePrice && price ? ((salePrice - price) / salePrice) * 100 : null

        return { row, price, salePrice, margin }
      }),
    [group, watchedPackingQuantity, products]
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
        observations: data.observations
      } as TCreateData<TOrder>
    }))

    ;[...new Set(productIds)].forEach((productId) =>
      upsertPackingDefault({
        supplierId: supplier.id,
        productId,
        packing: data.packing,
        packingQuantity: data.packingQuantity
      })
    )

    setSuccessCallbacks([handleClose])
    createOrdersBatchWithInvoiceLink({ invoice, matches })
  })

  const handleSellerCreated = (seller: TSeller) => {
    setValue('sellerId', seller.id, { shouldValidate: true, shouldDirty: true })
  }

  return {
    register,
    onSubmit,
    errors,
    control,
    sellers: filteredSellers,
    previewRows,
    handleSellerCreated
  }
}
