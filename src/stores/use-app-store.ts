import { create } from 'zustand'

import type { TAiSuggestion } from '@/infra'
import type {
  TFamily,
  TImportData,
  TInvoice,
  TOrder,
  TProduct,
  TQuote,
  TSeller,
  TSettings,
  TSupplier
} from '@/models'
import type { TCreateData, TCreateDataWithId, TUpdateData } from '@/types'

type TAppStore = {
  aiSuggestions: Record<string, TAiSuggestion[]>
  setAiSuggestions: (quoteId: string, suggestions: TAiSuggestion[]) => void
  products: TProduct[] | null
  setProducts: (products: TProduct[]) => void
  createProduct: (product: TCreateDataWithId<TProduct>) => void
  updateProduct: (product: TUpdateData<TProduct>) => void
  deleteProduct: (id: string) => void

  suppliers: TSupplier[] | null
  setSuppliers: (suppliers: TSupplier[]) => void
  createSupplier: (supplier: TCreateDataWithId<TSupplier>) => void
  updateSupplier: (supplier: TUpdateData<TSupplier>) => void
  deleteSupplier: (id: string) => void

  sellers: TSeller[] | null
  setSellers: (sellers: TSeller[]) => void
  createSeller: (seller: TCreateData<TSeller>) => void
  updateSeller: (seller: TUpdateData<TSeller>) => void
  deleteSeller: (id: string) => void

  families: TFamily[] | null
  setFamilies: (families: TFamily[]) => void
  createFamily: (family: TCreateDataWithId<TFamily>) => void
  updateFamily: (family: TUpdateData<TFamily>) => void
  deleteFamily: (id: string) => void

  quotes: TQuote[] | null
  setQuotes: (quotes: TQuote[]) => void
  createQuote: (quote: TCreateData<TQuote>) => void
  updateQuote: (quote: TUpdateData<TQuote>) => void
  deleteQuote: (id: string) => void

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
  deleteOrder: (id: string) => void

  quoteId: string | null
  setQuoteId: (id: string | null) => void
  historyProductId: string | null
  setHistoryProductId: (id: string | null) => void

  importData: (data: TImportData) => void

  invoices: TInvoice[] | null
  setInvoices: (invoices: TInvoice[]) => void
  createInvoice: (invoice: Omit<TInvoice, 'createdAt' | 'updatedAt'>) => void
  createInvoicesBatch: (
    invoices: Array<Omit<TInvoice, 'createdAt' | 'updatedAt'>>
  ) => void
  updateInvoice: (invoice: TUpdateData<TInvoice>) => void
  deleteInvoice: (id: string) => void

  settings: TSettings | null
  setSettings: (settings: TSettings | null) => void
  updateSettings: (data: TCreateData<TSettings>) => void
}

export const useAppStore = create<TAppStore>((set) => ({
  aiSuggestions: {},
  setAiSuggestions: (quoteId, suggestions) =>
    set((s) => ({
      aiSuggestions: { ...s.aiSuggestions, [quoteId]: suggestions }
    })),

  products: null,
  setProducts: (products) => set({ products }),
  createProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},

  suppliers: null,
  setSuppliers: (suppliers) => set({ suppliers }),
  createSupplier: () => {},
  updateSupplier: () => {},
  deleteSupplier: () => {},

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

  quoteId: null,
  setQuoteId: (id) => set({ quoteId: id }),
  historyProductId: null,
  setHistoryProductId: (id) => set({ historyProductId: id }),

  importData: () => {},

  invoices: null,
  setInvoices: (invoices) => set({ invoices }),
  createInvoice: () => {},
  createInvoicesBatch: () => {},
  updateInvoice: () => {},
  deleteInvoice: () => {},

  settings: null,
  setSettings: (settings) => set({ settings }),
  updateSettings: () => {}
}))
