import { create } from 'zustand'

import type {
  TFamily,
  TGroup,
  TImportData,
  TOrder,
  TProduct,
  TQuote,
  TSeller,
  TSupplier
} from '@/models'
import type { TCreateData, TUpdateData } from '@/types'

type TAppStore = {
  products: TProduct[] | null
  setProducts: (products: TProduct[]) => void
  createProduct: (product: TCreateData<TProduct>) => void
  updateProduct: (product: TUpdateData<TProduct>) => void
  deleteProduct: (id: string) => void

  suppliers: TSupplier[] | null
  setSuppliers: (suppliers: TSupplier[]) => void
  createSupplier: (supplier: TCreateData<TSupplier>) => void
  updateSupplier: (supplier: TUpdateData<TSupplier>) => void
  deleteSupplier: (id: string) => void

  sellers: TSeller[] | null
  setSellers: (sellers: TSeller[]) => void
  createSeller: (seller: TCreateData<TSeller>) => void
  updateSeller: (seller: TUpdateData<TSeller>) => void
  deleteSeller: (id: string) => void

  families: TFamily[] | null
  setFamilies: (families: TFamily[]) => void
  createFamily: (family: TCreateData<TFamily>) => void
  updateFamily: (family: TUpdateData<TFamily>) => void
  deleteFamily: (id: string) => void

  groups: TGroup[] | null
  setGroups: (groups: TGroup[]) => void
  createGroup: (group: TCreateData<TGroup>) => void
  updateGroup: (group: TUpdateData<TGroup>) => void
  deleteGroup: (id: string) => void

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
  updateOrder: (order: TUpdateData<TOrder>) => void
  deleteOrder: (id: string) => void

  quoteId: string | null
  setQuoteId: (id: string | null) => void
  historyProductId: string | null
  setHistoryProductId: (id: string | null) => void

  importData: (data: TImportData) => void
}

export const useAppStore = create<TAppStore>((set) => ({
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

  groups: null,
  setGroups: (groups) => set({ groups }),
  createGroup: () => {},
  updateGroup: () => {},
  deleteGroup: () => {},

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
  updateOrder: () => {},
  deleteOrder: () => {},

  quoteId: null,
  setQuoteId: (id) => set({ quoteId: id }),
  historyProductId: null,
  setHistoryProductId: (id) => set({ historyProductId: id }),

  importData: () => {}
}))
