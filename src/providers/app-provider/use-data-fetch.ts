import { useQueries, useQueryClient } from '@tanstack/react-query'
import { FirebaseError } from 'firebase/app'
import { useCallback, useEffect, useState } from 'react'

import { departmentModel } from '@/models/department/model'
import { familyModel } from '@/models/family/model'
import { ignoredProductModel } from '@/models/ignored-product/model'
import { ignoredSupplierModel } from '@/models/ignored-supplier/model'
import { invoiceModel } from '@/models/invoice/model'
import { orderModel } from '@/models/order/model'
import { packageBarcodeLinkModel } from '@/models/package-barcode-link/model'
import { packingDefaultModel } from '@/models/packing-default/model'
import { priceAdjustmentModel } from '@/models/price-adjustment/model'
import { productModel } from '@/models/product/model'
import { quoteModel } from '@/models/quote/model'
import { sellerModel } from '@/models/seller/model'
import { settingsModel } from '@/models/settings/model'
import { supplierModel } from '@/models/supplier/model'
import { useAlertStore } from '@/stores/use-alert-store'
import { useAppStore } from '@/stores/use-app-store'
import { useAuthStore } from '@/stores/use-auth-store'

const getErrorCode = (error: unknown) =>
  error instanceof FirebaseError ? error.code : 'unknown'

export const useDataFetch = () => {
  const { alert } = useAlertStore()
  const quoteId = useAppStore((state) => state.quoteId)
  const historyProductId = useAppStore((state) => state.historyProductId)
  const invoiceDateRange = useAppStore((state) => state.invoiceDateRange)
  const isEmailVerified = useAuthStore((state) => !!state.user?.emailVerified)

  // All collections share a single WebChannel connection: firing the 15 fetches
  // at once overflows its output buffer on a large catalog, and the SDK
  // silently resolves the queries with the empty local cache ("nenhum produto
  // cadastrado" after a reload). Each condition is independent of the queue
  // position, so a skipped query (e.g. no quoteId) releases the next one.
  const shouldFetch = [
    true, // products
    true, // ignored-products
    true, // package-barcode-links
    true, // suppliers
    true, // ignored-suppliers
    true, // sellers
    true, // families
    true, // departments
    true, // quotes
    !!quoteId, // orders (by quote)
    !!historyProductId, // orders (by product)
    true, // invoices (Invoices page period)
    true, // packing-defaults
    true, // settings
    true // price-adjustments
  ]

  const [readyCount, setReadyCount] = useState(1)

  const isEnabled = (index: number) =>
    isEmailVerified && shouldFetch[index] && index < readyCount

  const queries = useQueries({
    queries: [
      {
        queryKey: ['products'],
        queryFn: productModel.findMany,
        enabled: isEnabled(0)
      },
      {
        queryKey: ['ignored-products'],
        queryFn: ignoredProductModel.findMany,
        enabled: isEnabled(1)
      },
      {
        queryKey: ['package-barcode-links'],
        queryFn: packageBarcodeLinkModel.findMany,
        enabled: isEnabled(2)
      },
      {
        queryKey: ['suppliers'],
        queryFn: supplierModel.findMany,
        enabled: isEnabled(3)
      },
      {
        queryKey: ['ignored-suppliers'],
        queryFn: ignoredSupplierModel.findMany,
        enabled: isEnabled(4)
      },
      {
        queryKey: ['sellers'],
        queryFn: sellerModel.findMany,
        enabled: isEnabled(5)
      },
      {
        queryKey: ['families'],
        queryFn: familyModel.findMany,
        enabled: isEnabled(6)
      },
      {
        queryKey: ['departments'],
        queryFn: departmentModel.findMany,
        enabled: isEnabled(7)
      },
      {
        queryKey: ['quotes'],
        queryFn: quoteModel.findMany,
        enabled: isEnabled(8)
      },
      {
        queryKey: ['orders', quoteId],
        queryFn: () => orderModel.findManyByQuoteId(quoteId!),
        enabled: isEnabled(9)
      },
      {
        queryKey: ['orders', 'product', historyProductId],
        queryFn: () => orderModel.findManyByProductId(historyProductId!),
        enabled: isEnabled(10)
      },
      {
        queryKey: [
          'invoices',
          invoiceDateRange.startDate,
          invoiceDateRange.endDate
        ],
        queryFn: () => invoiceModel.findMany(invoiceDateRange),
        enabled: isEnabled(11)
      },
      {
        queryKey: ['packing-defaults'],
        queryFn: packingDefaultModel.findMany,
        enabled: isEnabled(12)
      },
      {
        queryKey: ['settings'],
        queryFn: settingsModel.find,
        enabled: isEnabled(13)
      },
      {
        queryKey: ['price-adjustments'],
        queryFn: priceAdjustmentModel.findMany,
        enabled: isEnabled(14)
      }
    ]
  })

  // State adjusted during render instead of an effect, so setState never fires
  // outside a real event/effect.
  if (readyCount < shouldFetch.length) {
    const previousIndex = readyCount - 1
    const isSettled =
      !shouldFetch.at(previousIndex) || queries[previousIndex].isFetched
    if (isSettled) setReadyCount(readyCount + 1)
  }

  const [
    { data: products },
    { data: ignoredProducts },
    { data: packageBarcodeLinks },
    { data: suppliers },
    { data: ignoredSuppliers },
    { data: sellers },
    { data: families },
    { data: departments },
    { data: quotes },
    { data: ordersByQuoteId },
    { data: ordersByProductId },
    { data: invoices },
    { data: packingDefaults },
    { data: settings },
    { data: priceAdjustments }
  ] = queries

  const isError = queries.some((query) => query.isError)

  useEffect(() => {
    if (isError) {
      alert({
        severity: 'error',
        title: 'Erro ao buscar dados',
        description: 'Atualize a página ou tente novamente mais tarde'
      })
    }
  }, [isError, alert])

  // Exposing the error only after the whole queue settles keeps a page whose
  // own collection is still queued from flashing another collection's error.
  const isQueueSettled =
    readyCount === shouldFetch.length &&
    queries.every((query) => !query.isFetching)
  const failedQuery = queries.find((query) => query.isError)
  const fetchErrorCode =
    isQueueSettled && failedQuery ? getErrorCode(failedQuery.error) : null

  const queryClient = useQueryClient()
  const retryFetch = useCallback(
    () =>
      queryClient.refetchQueries({
        predicate: (query) => query.state.status === 'error'
      }),
    [queryClient]
  )

  return {
    fetchErrorCode,
    retryFetch,
    products,
    ignoredProducts,
    packageBarcodeLinks,
    suppliers,
    ignoredSuppliers,
    sellers,
    families,
    departments,
    quotes,
    ordersByQuoteId,
    ordersByProductId,
    invoices,
    packingDefaults,
    settings,
    priceAdjustments
  }
}
