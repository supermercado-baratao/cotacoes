import type { Auth, User } from 'firebase/auth'
import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  state: { currentUser: null as User | null },
  listeners: new Set<(user: User | null) => void>()
}))

export const setAuthMockUser = (user: User | null) => {
  hoisted.state.currentUser = user
  hoisted.listeners.forEach((listener) => listener(user))
}

export const resetAuthMock = () => {
  hoisted.state.currentUser = null
  hoisted.listeners.clear()
}

export const getMockCurrentUserUid = (): string | undefined =>
  hoisted.state.currentUser?.uid

export const createFakeUser = (overrides: Partial<User> = {}): User =>
  ({
    uid: crypto.randomUUID(),
    email: 'user@example.com',
    displayName: 'Usuário de Teste',
    emailVerified: true,
    ...overrides
  }) as User

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>()
  return {
    ...actual,
    getAuth: () => hoisted.state as unknown as Auth,
    connectAuthEmulator: vi.fn(),
    onAuthStateChanged: (
      _auth: Auth,
      callback: (user: User | null) => void
    ) => {
      hoisted.listeners.add(callback)
      callback(hoisted.state.currentUser)
      return () => hoisted.listeners.delete(callback)
    },
    signOut: vi.fn(async () => setAuthMockUser(null)),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    sendEmailVerification: vi.fn(),
    applyActionCode: vi.fn(),
    updateProfile: vi.fn()
  }
})
