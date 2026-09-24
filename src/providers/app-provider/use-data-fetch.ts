import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  departmentModel,
  familyModel,
  ignoredProductModel,
  ignoredSupplierModel,
  invoiceModel,
  orderModel,
  packageBarcodeLinkModel,
  packingDefaultModel,
  priceAdjustmentModel,
  productModel,
  quoteModel,
  sellerModel,
  settingsModel,
  supplierModel
} from '@/models'
import { useAlertStore, useAppStore, useAuthStore } from '@/stores'

export const useDataFetch = () => {
  const { alert } = useAlertStore()
  const quoteId = useAppStore((state) => state.quoteId)
  const historyProductId = useAppStore((state) => state.historyProductId)
  const invoiceDateRange = useAppStore((state) => state.invoiceDateRange)
  const user = useAuthStore((state) => state.user)

  const queries = useQueries({
    queries: [
      {
        queryKey: ['products'],
        queryFn: productModel.findMany,
        enabled: !!user
      },
      {
        queryKey: ['ignored-products'],
        queryFn: ignoredProductModel.findMany,
        enabled: !!user
      },
      {
        queryKey: ['package-barcode-links'],
        queryFn: packageBarcodeLinkModel.findMany,
        enabled: !!user
      },
      {
        queryKey: ['suppliers'],
        queryFn: supplierModel.findMany,
        enabled: !!user
      },
      {
        queryKey: ['ignored-suppliers'],
        queryFn: ignoredSupplierModel.findMany,
        enabled: !!user
      },
      { queryKey: ['sellers'], queryFn: sellerModel.findMany, enabled: !!user },
      {
        queryKey: ['families'],
        queryFn: familyModel.findMany,
        enabled: !!user
      },
      {
        queryKey: ['departments'],
        queryFn: departmentModel.findMany,
        enabled: !!user
      },
      { queryKey: ['quotes'], queryFn: quoteModel.findMany, enabled: !!user },
      {
        queryKey: ['orders', quoteId],
        queryFn: () => orderModel.findManyByQuoteId(quoteId!),
        enabled: !!quoteId && !!user
      },
      {
        queryKey: ['orders', 'product', historyProductId],
        queryFn: () => orderModel.findManyByProductId(historyProductId!),
        enabled: !!historyProductId && !!user
      },
      {
        queryKey: [
          'invoices',
          invoiceDateRange.startDate,
          invoiceDateRange.endDate
        ],
        queryFn: () => invoiceModel.findMany(invoiceDateRange),
        enabled: !!user
      },
      {
        queryKey: ['packing-defaults'],
        queryFn: packingDefaultModel.findMany,
        enabled: !!user
      },
      {
        queryKey: ['settings'],
        queryFn: settingsModel.find,
        enabled: !!user
      },
      {
        queryKey: ['price-adjustments'],
        queryFn: priceAdjustmentModel.findMany,
        enabled: !!user
      }
    ]
  })

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

  return {
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
