import { create } from 'zustand'

type TCallbackStore = {
  successCallbacks: (() => void)[]
  errorCallbacks: (() => void)[]
  setSuccessCallbacks: (callbacks: (() => void)[]) => void
  setErrorCallbacks: (callbacks: (() => void)[]) => void
  handleSuccessCallbacks: () => void
  handleErrorCallbacks: () => void
}

export const useCallbackStore = create<TCallbackStore>()((set, get) => ({
  successCallbacks: [],
  errorCallbacks: [],
  setSuccessCallbacks: (callbacks) => set({ successCallbacks: callbacks }),
  setErrorCallbacks: (callbacks) => set({ errorCallbacks: callbacks }),
  handleSuccessCallbacks: () => {
    get().successCallbacks.forEach((cb) => cb())
    set({ successCallbacks: [] })
  },
  handleErrorCallbacks: () => {
    get().errorCallbacks.forEach((cb) => cb())
    set({ errorCallbacks: [] })
  }
}))
