import { render, screen, waitFor, within } from '@testing-library/react'
import { Timestamp } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import type { TInvoice, TPriceAdjustment, TProduct, TQuote } from '@/models'

import { createApp } from './_mocks/App'
import { seedCollection } from './_mocks/database'
import { createUser } from './orchestrator'

const now = Timestamp.now()

const makeProduct = (
  overrides: Partial<TProduct> & { id: string }
): TProduct => ({
  description: 'produto',
  price: 100,
  barcodes: [],
  packTypes: [],
  tax: null,
  margin: null,
  observations: null,
  familyId: null,
  departmentId: null,
  department: '',
  section: '',
  group: '',
  stock: 0,
  vrCreatedAt: '2026-01-01',
  createdAt: now,
  updatedAt: now,
  ...overrides
})

const makePriceAdjustment = (
  overrides: Partial<TPriceAdjustment> & { id: string; productId: string }
): TPriceAdjustment => ({
  code: overrides.productId,
  description: '',
  previousPrice: 0,
  fileCost: 0,
  newSalePrice: 0,
  lastEntryDate: null,
  changeDateTime: '',
  movementDate: null,
  user: '',
  productFound: true,
  currentSystemPrice: null,
  resolvedCost: 0,
  costSource: 'quote',
  quoteDate: null,
  supplierNames: [],
  supplierCosts: [],
  costDivergence: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

const makeQuote = (overrides: Partial<TQuote> & { id: string }): TQuote => ({
  items: [],
  orders: [],
  status: 'opened',
  date: '2026-01-01',
  observations: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

const makeInvoice = (
  overrides: Partial<TInvoice> & { id: string }
): TInvoice => ({
  accessKey: overrides.id,
  number: overrides.id,
  series: '1',
  emissionDate: '2026-01-01',
  supplierCnpj: '11111111000111',
  supplierName: 'FORNECEDOR',
  destinationCnpj: '22222222000122',
  totalValue: 0,
  items: [],
  verificationStatus: 'pending',
  quoteId: null,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

beforeAll(() => {
  createUser()

  // 5 produtos cadastrados, dos quais só 2 têm custo apurado (reajuste de
  // preços) e só 1 deles vende abaixo da margem padrão.
  seedCollection('products', [
    // preço 100, custo 70 -> margem atual 30%; padrão 40% -> abaixo
    makeProduct({ id: 'p1', description: 'produto abaixo', margin: 40 }),
    // preço 100, custo 70 -> margem atual 30%; padrão 20% -> acima
    makeProduct({ id: 'p2', description: 'produto ok', margin: 20 }),
    makeProduct({ id: 'p3', description: 'produto sem reajuste' }),
    makeProduct({ id: 'p4', description: 'produto sem reajuste 2' }),
    makeProduct({ id: 'p5', description: 'produto sem reajuste 3' })
  ])

  seedCollection('price-adjustments', [
    makePriceAdjustment({ id: 'p1', productId: 'p1', resolvedCost: 70 }),
    makePriceAdjustment({ id: 'p2', productId: 'p2', resolvedCost: 70 })
  ])

  // 3 cotações abertas, 1 fechada
  seedCollection('quotes', [
    makeQuote({ id: 'q1', status: 'opened' }),
    makeQuote({ id: 'q2', status: 'opened' }),
    makeQuote({ id: 'q3', status: 'opened' }),
    makeQuote({ id: 'q4', status: 'closed' })
  ])

  // 2 notas pendentes, 1 aprovada
  seedCollection('invoices', [
    makeInvoice({ id: 'i1', verificationStatus: 'pending' }),
    makeInvoice({ id: 'i2', verificationStatus: 'pending' }),
    makeInvoice({ id: 'i3', verificationStatus: 'approved' })
  ])
})

describe('dashboard', () => {
  test('shows aggregate stats and flags products sold below their target margin', async () => {
    const { App } = createApp('/dashboard')
    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Dashboard' })
      ).toBeInTheDocument()
    })

    const productsCard = screen
      .getByText('Produtos cadastrados')
      .closest('div')!
    expect(within(productsCard).getByText('5')).toBeInTheDocument()

    const quotesCard = screen.getByText('Cotações abertas').closest('div')!
    expect(within(quotesCard).getByText('3')).toBeInTheDocument()

    const invoicesCard = screen
      .getByText('Notas pendentes de verificação')
      .closest('div')!
    expect(within(invoicesCard).getByText('2')).toBeInTheDocument()

    // "Produtos abaixo/acima da margem" aparecem duas vezes cada: como
    // rótulo do card e como título da seção da tabela — o card é o primeiro
    // no DOM em cada par.
    const belowMarginCard = screen
      .getAllByText('Produtos abaixo da margem')[0]
      .closest('div')!
    expect(within(belowMarginCard).getByText('1')).toBeInTheDocument()

    const aboveMarginCard = screen
      .getAllByText('Produtos acima da margem')[0]
      .closest('div')!
    expect(within(aboveMarginCard).getByText('1')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('PRODUTO ABAIXO')).toBeInTheDocument()
    })

    // PRODUTO OK vende com margem atual (30%) acima da padrão (20%), então
    // aparece na seção "acima da margem", não na de "abaixo".
    const belowMarginSection = screen
      .getAllByText('Produtos abaixo da margem')[1]
      .closest('div')!
    expect(
      within(belowMarginSection).queryByText('PRODUTO OK')
    ).not.toBeInTheDocument()

    const aboveMarginSection = screen
      .getAllByText('Produtos acima da margem')[1]
      .closest('div')!
    expect(
      within(aboveMarginSection).getByText('PRODUTO OK')
    ).toBeInTheDocument()
  })
})
