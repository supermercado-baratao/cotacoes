import { create } from 'zustand'

import type {
  TFamily,
  TProduct,
  TProductHistory,
  TProductHistoryType,
  TSeller,
  TSupplier
} from '@/models'
import type { TCreateData, TUpdateData } from '@/types'

type THistorySelection = {
  productId: string
  field: TProductHistoryType
}

type TAppStore = {
  products: TProduct[] | null
  setProducts: (products: TProduct[]) => void
  createProduct: (product: TCreateData<TProduct>) => void
  updateProduct: (product: TUpdateData<TProduct>) => void
  deleteProduct: (id: string) => void

  historySelection: THistorySelection | null
  setHistorySelection: (selection: THistorySelection | null) => void
  productHistory: TProductHistory[] | null
  setProductHistory: (history: TProductHistory[] | null) => void

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
}

export const useAppStore = create<TAppStore>((set) => ({
  products: null,
  setProducts: (products) => set({ products }),
  createProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},

  historySelection: null,
  setHistorySelection: (historySelection) => set({ historySelection }),
  productHistory: null,
  setProductHistory: (productHistory) => set({ productHistory }),

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
  deleteFamily: () => {}
}))
