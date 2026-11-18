import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { useDeleteHandler } from '@/hooks/use-delete-handler'
import type { TPackingDefault } from '@/models/packing-default/types'
import type { TSupplier } from '@/models/supplier/types'
import type { TInvoiceItemRow } from '@/pages/invoices/detail/use-invoice-detail-handler'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { getItemUnitCost } from '@/utils/entry-cost'
import {
  evaluateMargin,
  getMarginPercent,
  getMarginTolerance
} from '@/utils/margin'
import {
  findPackingDefault,
  getInvoiceItemPacking
} from '@/utils/packing-defaults'

import { MIN_PACKING_QUANTITY, schema, type TSchema } from './schema'

export const useFormHandler = (
  row: TInvoiceItemRow | null,
  supplier: TSupplier | null,
  handleClose: () => void
) => {
  const {
    products,
    packingDefaults,
    settings,
    savePackingCorrection,
    deletePackingDefault
  } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const packing = row ? getInvoiceItemPacking(row.unit) : ''

  const packingDefault = useMemo(
    () =>
      supplier && row?.productId
        ? findPackingDefault(packingDefaults ?? [], {
            supplierId: supplier.id,
            productId: row.productId,
            packing
          })
        : null,
    [row, supplier, packing, packingDefaults]
  )

  const defaultValues: TSchema = useMemo(
    () => ({
      packingQuantity:
        packingDefault?.packingQuantity ??
        Math.max(1, Math.round(row?.packQuantity ?? 1))
    }),
    [packingDefault, row]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const packingQuantity = useWatch({ control, name: 'packingQuantity' })

  const preview = useMemo(() => {
    if (
      !row ||
      row.isBonus ||
      !Number.isSafeInteger(packingQuantity) ||
      packingQuantity < MIN_PACKING_QUANTITY
    ) {
      return null
    }
    const unitCost = getItemUnitCost(row, packingQuantity)
    if (unitCost == null || !row.salePrice) {
      return { unitCost, margin: null, marginStatus: null }
    }
    const product = products?.find((product) => product.id === row.productId)
    const margin = getMarginPercent(row.salePrice, unitCost)
    const { status } = evaluateMargin(
      margin,
      getMarginTolerance(settings, product?.departmentId ?? null)
    )
    return { unitCost, margin, marginStatus: status }
  }, [row, packingQuantity, products, settings])

  const onSubmit = handleSubmit((data) => {
    if (!supplier || !row?.productId) return
    setSuccessCallbacks([handleClose])
    savePackingCorrection({
      supplierId: supplier.id,
      productId: row.productId,
      packing,
      packingQuantity: data.packingQuantity
    })
  })

  const {
    itemToDelete: packingDefaultToDelete,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TPackingDefault>((item) => {
    setSuccessCallbacks([handleClose])
    deletePackingDefault(item.id)
  })

  const handleDeleteDialogOpen = () => {
    if (packingDefault) handleDelete(packingDefault)
  }

  return {
    register,
    onSubmit,
    errors,
    packing,
    preview,
    hasCorrection: !!packingDefault,
    isDeleteDialogOpen: !!packingDefaultToDelete,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  }
}
