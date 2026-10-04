import dayjs from 'dayjs'
import { create } from 'zustand'

import type { TAiSuggestion } from '@/infra'
import type {
  TDepartment,
  TFamily,
  TIgnoredProduct,
  TIgnoredSupplier,
  TImportData,
  TInvoice,
  TInvoiceDateRange,
  TOrder,
  TPackageBarcodeLink,
  TPackingDefault,
  TPriceAdjustment,
  TProduct,
  TQuote,
  TSeller,
  TSettings,
  TSupplier
} from '@/models'
import type { TCreateData, TCreateDataWithId, TUpdateData } from '@/types'

const DEFAULT_INVOICE_LOOKBACK_DAYS = 30

const defaultInvoiceDateRange = (): TInvoiceDateRange => ({
  startDate: dayjs()
    .subtract(DEFAULT_INVOICE_LOOKBACK_DAYS, 'day')
    .format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD')
})

export type TQuotesSelectedDate = {
  year: number
  month: number
  day: number
}

type TAppStore = {
  fetchErrorCode: string | null
  retryFetch: () => void

  aiSuggestions: Record<string, TAiSuggestion[]>
  setAiSuggestions: (quoteId: string, suggestions: TAiSuggestion[]) => void
  products: TProduct[] | null
  setProducts: (products: TProduct[]) => void
  createProduct: (
    product: TCreateDataWithId<TProduct>,
    options?: { onSuccess?: (product: TProduct) => void }
  ) => void
  updateProduct: (product: TUpdateData<TProduct>) => void
  updateProductsBatch: (products: TUpdateData<TProduct[]>) => void
  deleteProduct: (id: string) => void

  ignoredProducts: TIgnoredProduct[] | null
  setIgnoredProducts: (ignoredProducts: TIgnoredProduct[]) => void
  createIgnoredProduct: (data: TCreateDataWithId<TIgnoredProduct>) => void
  deleteIgnoredProduct: (id: string) => void

  packageBarcodeLinks: TPackageBarcodeLink[] | null
  setPackageBarcodeLinks: (links: TPackageBarcodeLink[]) => void
  createPackageBarcodeLink: (
    data: TCreateDataWithId<TPackageBarcodeLink>
  ) => void

  suppliers: TSupplier[] | null
  setSuppliers: (suppliers: TSupplier[]) => void
  createSupplier: (
    supplier: TCreateDataWithId<TSupplier>,
    options?: { onSuccess?: (supplier: TSupplier) => void }
  ) => void
  updateSupplier: (supplier: TUpdateData<TSupplier>) => void
  deleteSupplier: (id: string) => void

  ignoredSuppliers: TIgnoredSupplier[] | null
  setIgnoredSuppliers: (ignoredSuppliers: TIgnoredSupplier[]) => void
  createIgnoredSupplier: (data: TCreateDataWithId<TIgnoredSupplier>) => void
  deleteIgnoredSupplier: (id: string) => void

  sellers: TSeller[] | null
  setSellers: (sellers: TSeller[]) => void
  createSeller: (
    seller: TCreateData<TSeller>,
    options?: { onSuccess?: (seller: TSeller) => void }
  ) => void
  updateSeller: (seller: TUpdateData<TSeller>) => void
  deleteSeller: (id: string) => void

  families: TFamily[] | null
  setFamilies: (families: TFamily[]) => void
  createFamily: (family: TCreateDataWithId<TFamily>) => void
  updateFamily: (family: TUpdateData<TFamily>) => void
  deleteFamily: (id: string) => void

  departments: TDepartment[] | null
  setDepartments: (departments: TDepartment[]) => void
  createDepartment: (department: TCreateData<TDepartment>) => void
  updateDepartment: (department: TUpdateData<TDepartment>) => void
  deleteDepartment: (id: string) => void

  quotes: TQuote[] | null
  setQuotes: (quotes: TQuote[]) => void
  createQuote: (quote: TCreateData<TQuote>) => void
  updateQuote: (quote: TUpdateData<TQuote>, ordersToDelete?: TOrder[]) => void
  deleteQuote: (id: string, ordersToDelete?: TOrder[]) => void

  ordersByQuoteId: TOrder[] | null
  setOrdersByQuoteId: (orders: TOrder[]) => void
  ordersByProductId: TOrder[] | null
  setOrdersByProductId: (orders: TOrder[]) => void
  createOrder: (order: TCreateData<TOrder>) => void
  createOrdersBatch: (orders: TCreateData<TOrder>[]) => void
  createOrderWithInvoiceLink: (data: {
    order: TCreateData<TOrder>
    invoice: TInvoice
    itemNumber: number
  }) => void
  createOrdersBatchWithInvoiceLink: (data: {
    invoice: TInvoice
    matches: Array<{ itemNumber: number; order: TCreateData<TOrder> }>
  }) => void
  updateOrder: (order: TUpdateData<TOrder>) => void
  deleteOrder: (order: TOrder) => void

  packingDefaults: TPackingDefault[] | null
  setPackingDefaults: (packingDefaults: TPackingDefault[]) => void
  upsertPackingDefault: (data: TCreateData<TPackingDefault>) => void

  quoteId: string | null
  setQuoteId: (id: string | null) => void
  historyProductId: string | null
  setHistoryProductId: (id: string | null) => void
  quotesSelectedDate: TQuotesSelectedDate | null
  setQuotesSelectedDate: (date: TQuotesSelectedDate | null) => void

  importData: (data: TImportData) => void

  invoices: TInvoice[] | null
  setInvoices: (invoices: TInvoice[]) => void
  invoiceDateRange: TInvoiceDateRange
  setInvoiceDateRange: (range: TInvoiceDateRange) => void
  invoiceSearch: string
  setInvoiceSearch: (search: string) => void
  createInvoice: (invoice: Omit<TInvoice, 'createdAt' | 'updatedAt'>) => void
  createInvoicesBatch: (
    invoices: Array<Omit<TInvoice, 'createdAt' | 'updatedAt'>>
  ) => void
  updateInvoice: (invoice: TUpdateData<TInvoice>) => void
  deleteInvoice: (id: string) => void

  settings: TSettings | null
  setSettings: (settings: TSettings | null) => void
  updateSettings: (data: Partial<TCreateData<TSettings>>) => void

  priceAdjustments: TPriceAdjustment[] | null
  setPriceAdjustments: (priceAdjustments: TPriceAdjustment[]) => void
  replacePriceAdjustments: (
    priceAdjustments: TCreateDataWithId<TPriceAdjustment[]>
  ) => void
}

export const useAppStore = create<TAppStore>((set) => ({
  fetchErrorCode: null,
  retryFetch: () => {},

  aiSuggestions: {},
  setAiSuggestions: (quoteId, suggestions) =>
    set((s) => ({
      aiSuggestions: { ...s.aiSuggestions, [quoteId]: suggestions }
    })),

  products: null,
  setProducts: (products) => set({ products }),
  createProduct: () => {},
  updateProduct: () => {},
  updateProductsBatch: () => {},
  deleteProduct: () => {},

  ignoredProducts: null,
  setIgnoredProducts: (ignoredProducts) => set({ ignoredProducts }),
  createIgnoredProduct: () => {},
  deleteIgnoredProduct: () => {},

  packageBarcodeLinks: null,
  setPackageBarcodeLinks: (packageBarcodeLinks) => set({ packageBarcodeLinks }),
  createPackageBarcodeLink: () => {},

  suppliers: null,
  setSuppliers: (suppliers) => set({ suppliers }),
  createSupplier: () => {},
  updateSupplier: () => {},
  deleteSupplier: () => {},

  ignoredSuppliers: null,
  setIgnoredSuppliers: (ignoredSuppliers) => set({ ignoredSuppliers }),
  createIgnoredSupplier: () => {},
  deleteIgnoredSupplier: () => {},

  sellers: null,
  setSellers: (sellers) => set({ sellers }),
  createSeller: () => {},
  updateSeller: () => {},
  deleteSeller: () => {},

  families: null,
  setFamilies: (families) => set({ families }),
  createFamily: () => {},
  updateFamily: () => {},
  deleteFamily: () => {},

  departments: null,
  setDepartments: (departments) => set({ departments }),
  createDepartment: () => {},
  updateDepartment: () => {},
  deleteDepartment: () => {},

  quotes: null,
  setQuotes: (quotes) => set({ quotes }),
  createQuote: () => {},
  updateQuote: () => {},
  deleteQuote: () => {},

  ordersByQuoteId: null,
  setOrdersByQuoteId: (orders) => set({ ordersByQuoteId: orders }),
  ordersByProductId: null,
  setOrdersByProductId: (orders) => set({ ordersByProductId: orders }),
  createOrder: () => {},
  createOrdersBatch: () => {},
  createOrderWithInvoiceLink: () => {},
  createOrdersBatchWithInvoiceLink: () => {},
  updateOrder: () => {},
  deleteOrder: () => {},

  packingDefaults: null,
  setPackingDefaults: (packingDefaults) => set({ packingDefaults }),
  upsertPackingDefault: () => {},

  quoteId: null,
  setQuoteId: (id) => set({ quoteId: id }),
  historyProductId: null,
  setHistoryProductId: (id) => set({ historyProductId: id }),
  quotesSelectedDate: null,
  setQuotesSelectedDate: (date) => set({ quotesSelectedDate: date }),

  importData: () => {},

  invoices: null,
  setInvoices: (invoices) => set({ invoices }),
  invoiceDateRange: defaultInvoiceDateRange(),
  setInvoiceDateRange: (range) => set({ invoiceDateRange: range }),
  invoiceSearch: '',
  setInvoiceSearch: (search) => set({ invoiceSearch: search }),
  createInvoice: () => {},
  createInvoicesBatch: () => {},
  updateInvoice: () => {},
  deleteInvoice: () => {},

  settings: null,
  setSettings: (settings) => set({ settings }),
  updateSettings: () => {},

  priceAdjustments: null,
  setPriceAdjustments: (priceAdjustments) => set({ priceAdjustments }),
  replacePriceAdjustments: () => {}
}))
