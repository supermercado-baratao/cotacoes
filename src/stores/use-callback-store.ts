import { create } from 'zustand'

type TCallbackEntry = {
  success: (() => void)[]
  error: (() => void)[]
}

type TCallbackStore = {
  queue: TCallbackEntry[]
  setSuccessCallbacks: (callbacks: (() => void)[]) => void
  setErrorCallbacks: (callbacks: (() => void)[]) => void
  handleSuccessCallbacks: () => void
  handleErrorCallbacks: () => void
}

export const useCallbackStore = create<TCallbackStore>()((set, get) => ({
  queue: [],
  setSuccessCallbacks: (callbacks) =>
    set((state) => ({
      queue: [...state.queue, { success: callbacks, error: [] }]
    })),
  setErrorCallbacks: (callbacks) =>
    set((state) => {
      const lastIndex = state.queue.length - 1
      if (lastIndex < 0) return { queue: [{ success: [], error: callbacks }] }
      const queue = [...state.queue]
      queue[lastIndex] = { ...queue[lastIndex], error: callbacks }
      return { queue }
    }),
  handleSuccessCallbacks: () => {
    const [entry, ...rest] = get().queue
    const callbacks = entry?.success ?? []
    for (const callback of callbacks) callback()
    set({ queue: rest })
  },
  handleErrorCallbacks: () => {
    const [entry, ...rest] = get().queue
    const callbacks = entry?.error ?? []
    for (const callback of callbacks) callback()
    set({ queue: rest })
  }
}))
