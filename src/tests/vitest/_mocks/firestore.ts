import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({ existingIds: new Set<string>() }))

export const seedExistingInvoiceIds = (ids: string[]) => {
  ids.forEach((id) => hoisted.existingIds.add(id))
}

export const resetFirestoreMock = () => {
  hoisted.existingIds.clear()
}

type TFakeTransaction = {
  get: (ref: { id: string }) => Promise<{ exists: () => boolean }>
  set: (ref: { id: string }, data: unknown) => void
}

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>()
  return {
    ...actual,
    doc: vi.fn((_db: unknown, _path: string, id: string) => ({ id })),
    runTransaction: vi.fn(
      async (
        _db: unknown,
        updateFunction: (t: TFakeTransaction) => Promise<void>
      ) => {
        await updateFunction({
          get: (ref) =>
            Promise.resolve({ exists: () => hoisted.existingIds.has(ref.id) }),
          set: (ref) => {
            hoisted.existingIds.add(ref.id)
          }
        })
      }
    )
  }
})
