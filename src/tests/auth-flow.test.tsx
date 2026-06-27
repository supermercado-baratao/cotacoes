import { faker } from '@faker-js/faker'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'

import { createApp } from './_mocks/App'
import orchestrator from './orchestrator'

describe('Auth flow', () => {
  beforeEach(async () => {
    await orchestrator.clearEmulatorData()
  })

  test('For anonymous user', async () => {
    const event = userEvent.setup()

    const { router, App } = createApp('/dashboard')
    render(<App />)

    await waitFor(async () => {
      expect(router.state.location.pathname).toBe('/signin')
      await event.click(screen.getByRole('link', { name: 'Criar conta' }))
    })
    expect(router.state.location.pathname).toBe('/signup')

    await event.type(screen.getByLabelText('Nome'), faker.person.fullName())
    const email = faker.internet.email()
    await event.type(screen.getByLabelText('E-mail'), email)
    const password = faker.internet.password()
    await event.type(screen.getByLabelText('Senha'), password)
    await event.type(screen.getByLabelText('Confirmar senha'), password)
    await event.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(async () => {
      expect(router.state.location.pathname).toBe('/verify-email')
    })
    await orchestrator.verifyEmail(email)
    await event.click(
      screen.getByRole('button', { name: 'Já verifiquei, entrar' })
    )
    await waitFor(async () => {
      expect(router.state.location.pathname).toBe('/dashboard')
      await event.click(screen.getByRole('button', { name: 'Sair' }))
    })
    expect(router.state.location.pathname).toBe('/signin')
  })
})
