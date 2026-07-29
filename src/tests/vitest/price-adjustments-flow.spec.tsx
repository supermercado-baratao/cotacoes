import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import {
  quoteModel,
  type TInvoice,
  type TOrder,
  type TSupplier
} from '@/models'
import { useAppStore } from '@/stores'

import { createApp } from './_mocks/App'
import { databaseMock, seedCollection } from './_mocks/database'
import { readMockFile } from './_utils/read-mock-file'
import { createUser, populateDatabase } from './orchestrator'

// Fixture pequena e dedicada (5 linhas) em vez do arquivo real de ~2400
// produtos: com "expandir por padrão" ligado, o arquivo real monta ~150
// DataGrids simultâneos no primeiro render — rápido o bastante num navegador
// real, mas caro demais no jsdom (chegou a passar de 100s por teste e ficar
// instável mesmo com timeouts generosos). O parser/cruzamento em si já foi
// validado à parte contra o arquivo real (ver histórico da conversa); aqui o
// foco é o fluxo ponta-a-ponta.
const REAJUSTE_XLSX = 'price-adjustments-small.xlsx'

const OLD_QUOTE_ITEM_ID = crypto.randomUUID()
const RECENT_QUOTE_ITEM_ID = crypto.randomUUID()
const ORDER_RECENT_B_ID = crypto.randomUUID()
const INVOICE_ID = crypto.randomUUID()

const SUPPLIER_A: TSupplier = {
  id: 'supplier-a',
  legalName: 'FORNECEDOR A LTDA',
  tradeName: 'FORNECEDOR A',
  cnpj: '11111111000111',
  email: null,
  phone: null,
  vrCreatedAt: null,
  observations: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

const SUPPLIER_B: TSupplier = {
  id: 'supplier-b',
  legalName: 'FORNECEDOR B LTDA',
  tradeName: 'FORNECEDOR B',
  cnpj: '22222222000122',
  email: null,
  phone: null,
  vrCreatedAt: null,
  observations: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

const baseOrder = {
  productId: '198954',
  packing: 'UN',
  packingQuantity: null,
  sellerId: null,
  observations: null,
  quantity: 1,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

beforeAll(async () => {
  createUser()
  await populateDatabase()

  const oldQuote = await quoteModel.create({
    items: [
      {
        id: OLD_QUOTE_ITEM_ID,
        description: 'AZEITE ANDORINHA',
        salePrice: null,
        priceRef: null
      }
    ],
    orders: [],
    status: 'closed',
    date: '2026-01-01',
    observations: null
  })

  const recentQuote = await quoteModel.create({
    items: [
      {
        id: RECENT_QUOTE_ITEM_ID,
        description: 'AZEITE ANDORINHA',
        salePrice: null,
        priceRef: null
      }
    ],
    orders: [],
    status: 'opened',
    date: '2026-06-15',
    observations: null
  })

  seedCollection('suppliers', [SUPPLIER_A, SUPPLIER_B])

  const oldOrder: TOrder = {
    ...baseOrder,
    id: crypto.randomUUID(),
    quoteId: oldQuote.id,
    quoteItemId: OLD_QUOTE_ITEM_ID,
    invoiceId: null,
    price: 15,
    supplierId: SUPPLIER_A.id,
    date: oldQuote.date
  }

  const recentOrderA: TOrder = {
    ...baseOrder,
    id: crypto.randomUUID(),
    quoteId: recentQuote.id,
    quoteItemId: RECENT_QUOTE_ITEM_ID,
    invoiceId: null,
    price: 17,
    supplierId: SUPPLIER_A.id,
    date: recentQuote.date
  }

  const recentOrderB: TOrder = {
    ...baseOrder,
    id: ORDER_RECENT_B_ID,
    quoteId: recentQuote.id,
    quoteItemId: RECENT_QUOTE_ITEM_ID,
    invoiceId: INVOICE_ID,
    price: 16,
    supplierId: SUPPLIER_B.id,
    date: recentQuote.date
  }

  seedCollection('orders', [oldOrder, recentOrderA, recentOrderB])

  const invoice: TInvoice = {
    id: INVOICE_ID,
    accessKey: 'fake-access-key-198954',
    number: '9500',
    series: '1',
    emissionDate: '2026-06-15T10:00:00-03:00',
    supplierCnpj: SUPPLIER_B.cnpj,
    supplierName: SUPPLIER_B.tradeName,
    destinationCnpj: '99999999000199',
    totalValue: 15.5,
    items: [
      {
        itemNumber: 1,
        supplierProductCode: 'AZ-198954',
        barcode: null,
        calculatedBarcode: null,
        packageBarcode: null,
        description: 'AZEITE ANDORINHA EXTRA VIRGEM 250ML',
        unit: 'UN',
        quantity: 1,
        unitPrice: 15.5,
        totalPrice: 15.5,
        productId: '198954',
        orderId: ORDER_RECENT_B_ID,
        matchStatus: 'matched',
        priceDivergence: null,
        quantityDivergence: null
      }
    ],
    verificationStatus: 'pending',
    quoteId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }

  seedCollection('invoices', [invoice])
})

const getFileInput = (): HTMLInputElement =>
  document.querySelector('input[type="file"]') as HTMLInputElement

const uploadReajusteFile = async (
  event: ReturnType<typeof userEvent.setup>,
  filename: string
) => {
  const buffer = await readMockFile(filename)
  const file = new File([new Uint8Array(buffer)], filename)
  await event.upload(getFileInput(), file)
}

const openImportDialog = async (event: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: 'Importar Arquivo' })
    ).toBeInTheDocument()
  })

  // O botão abre o modal só quando os dados globais já carregaram (evita
  // cruzar o arquivo contra dados parciais). A importação em si não pede
  // nenhuma data — o período é derivado da própria "Data Movimento".
  await waitFor(() => {
    const state = useAppStore.getState()
    expect(state.products).not.toBeNull()
    expect(state.quotes).not.toBeNull()
    expect(state.invoices).not.toBeNull()
    expect(state.suppliers).not.toBeNull()
    expect(state.families).not.toBeNull()
  })

  await event.click(screen.getByRole('button', { name: 'Importar Arquivo' }))

  await waitFor(() => {
    expect(
      screen.getByText('Arraste e solte o arquivo de reajuste aqui')
    ).toBeInTheDocument()
  })
}

const getRowByText = (text: string): HTMLElement => {
  const cell = screen.getByText(text)
  return cell.closest('[role="row"]') as HTMLElement
}

// A célula de fornecedores junta os nomes com um Divider entre eles (mesmo
// padrão de quotes/_components/table/columns.tsx), então o texto não fica
// isolado num único elemento — getByText não encontra "FORNECEDOR A" sozinho.
const getCellText = (row: HTMLElement, field: string): string =>
  row.querySelector(`[data-field="${field}"]`)?.textContent ?? ''

describe('Price adjustments flow', () => {
  test('Importa, dedupe por Código, cruza com a cotação mais recente priorizando a nota fiscal, atualiza preços e salva o relatório', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/price-adjustments')
    render(<App />)

    await openImportDialog(event)
    await uploadReajusteFile(event, REAJUSTE_XLSX)

    await waitFor(() => {
      expect(
        screen.getByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
      ).toBeInTheDocument()
    })

    // '198954' aparece 2x no arquivo (mesma correção de preço no mesmo dia)
    // — só uma linha deve sobrar, com os dados da mais recente (Preço Venda
    // 21.98, não o 99.99 da linha superada).
    expect(
      screen.getAllByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
    ).toHaveLength(1)

    const azeiteRow = getRowByText('AZEITE ANDORINHA EXTRA VIRGEM 250ML VD')
    // Preço Venda (arquivo) e Preço Atual (sistema) coincidem em 21.98 aqui
    // — por isso via data-field, não getByText (ambíguo entre as 2 células).
    expect(getCellText(azeiteRow, 'newSalePrice')).toContain('R$ 21,98')
    expect(getCellText(azeiteRow, 'currentSystemPrice')).toContain('R$ 21,98')
    // Custo real = média(17.00 do pedido A, 15.50 da nota vinculada ao pedido B)
    // — não 16.89 (custo do arquivo) nem 16.00 (preço do pedido B, que a nota vence).
    expect(within(azeiteRow).getByText('R$ 16,25')).toBeInTheDocument()
    expect(within(azeiteRow).getByText('R$ -0,64')).toBeInTheDocument()
    expect(getCellText(azeiteRow, 'supplierNames')).toContain('FORNECEDOR A')
    expect(getCellText(azeiteRow, 'supplierNames')).toContain('FORNECEDOR B')
    expect(
      within(azeiteRow).queryByText('Sem cotação recente')
    ).not.toBeInTheDocument()

    const chaRow = getRowByText('CHA LEAO CAMOMILA 10UN')
    // Sem pedido/cotação recente, o custo real cai no custo do arquivo (REP)
    // — por isso "Custo REP" e "Custo Real" mostram o mesmo valor aqui.
    expect(getCellText(chaRow, 'fileCost')).toContain('R$ 2,56')
    expect(getCellText(chaRow, 'resolvedCost')).toContain('R$ 2,56')
    expect(within(chaRow).getByText('Sem cotação recente')).toBeInTheDocument()

    // O import atualiza direto o preço de venda de todo produto do relatório
    // já cadastrado — sem etapa de confirmação. '217636' tem preço 5.48 no
    // catálogo (import-data.xlsx) e 5.55 no arquivo de reajuste.
    await waitFor(() => {
      const product = (useAppStore.getState().products ?? []).find(
        (p) => p.id === '217636'
      )
      expect(product?.price).toBeCloseTo(5.55)
    })

    // A coleção price-adjustments guarda o relatório inteiro (substituindo
    // qualquer import anterior), com a Data Movimento de cada linha.
    await waitFor(() => {
      const priceAdjustments = useAppStore.getState().priceAdjustments ?? []
      expect(priceAdjustments).toHaveLength(4)
      const azeite = priceAdjustments.find((p) => p.code === '198954')
      expect(azeite?.movementDate).toBe('2026-06-10')
    })

    // Os campos de período só aparecem quando há dados salvos, com o padrão
    // sendo a menor/maior Data Movimento encontrada no relatório importado
    // ('198954'/'199770'/'000427' em 10/06, '217636' em 11/06).
    await waitFor(() => {
      expect(screen.getByLabelText('Início do período')).toHaveValue(
        '2026-06-10'
      )
      expect(screen.getByLabelText('Fim do período')).toHaveValue('2026-06-11')
    })
  }, 20000)

  test('Grupo "Não cadastrado" começa colapsado e pode ser expandido', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/price-adjustments')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('NÃO CADASTRADO')).toBeInTheDocument()
    })

    expect(
      screen.queryByText('VINAGRE MARATA 750ML VINHO TINTO PET')
    ).not.toBeInTheDocument()

    await event.click(screen.getByText('NÃO CADASTRADO'))

    await waitFor(() => {
      expect(
        screen.getByText('VINAGRE MARATA 750ML VINHO TINTO PET')
      ).toBeInTheDocument()
    })

    const row = getRowByText('VINAGRE MARATA 750ML VINHO TINTO PET')
    expect(within(row).getByText('Não cadastrado')).toBeInTheDocument()
  }, 15000)

  test('Mostra erro e permite tentar novamente quando a busca de pedidos falha', async () => {
    const event = userEvent.setup()
    const { App } = createApp('/price-adjustments')
    render(<App />)

    await openImportDialog(event)

    databaseMock.findMany.mockRejectedValueOnce(new Error('network error'))

    await uploadReajusteFile(event, REAJUSTE_XLSX)

    await waitFor(() => {
      expect(screen.getByText('network error')).toBeInTheDocument()
    })

    await event.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      screen.getByText('Arraste e solte o arquivo de reajuste aqui')
    ).toBeInTheDocument()
  }, 15000)
})
