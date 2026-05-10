import { create } from 'zustand'

import type { TProduct } from '@/models'
import type { TCreateData, TUpdateData } from '@/types'

type TAppStore = {
  products: TProduct[]
  setProducts: (products: TProduct[]) => void
  createProduct: (product: TCreateData<TProduct>) => void
  updateProduct: (product: TUpdateData<TProduct>) => void
  deleteProduct: (id: string) => void
}

export const useAppStore = create<TAppStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  createProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {}
}))
