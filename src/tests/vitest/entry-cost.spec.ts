import { Timestamp } from 'firebase/firestore'
import { describe, expect, test } from 'vitest'

import type { TInvoice, TInvoiceItem, TProduct, TSupplier } from '@/models'
import { parseNfe } from '@/pages/invoices/utils'
import {
  buildEntryCostMap,
  getCostDivergence,
  getEntryUnitCost,
  isBonusEntry,
  resolvePackQuantity
} from '@/utils'

import { readMockFile } from './_utils/read-mock-file'

const now = Timestamp.now()

const QUOTE_2_DIR = 'quotes/quote-2-2026-04-01-2026-05-31'
// Mesma entrega do fornecedor CONCORD: 955716 é a venda (CFOP 5102) e 955715
// a bonificação (CFOP 5910) do mesmo sabão.
const SALE_XML = `${QUOTE_2_DIR}/NFe29260405853741000139550010009557161392431151.xml`
const BONUS_XML = `${QUOTE_2_DIR}/NFe29260405853741000139550010009557151161245134.xml`

const SUPPLIER_ID = '71'
const SUPPLIER_CNPJ = '05853741000139'
const SOAP_BARCODE = '7908324404869'

const makeProduct = (overrides: Partial<TProduct> = {}): TProduct => ({
  id: '215155',
  description: 'SAB BARRA ASSIM 800G COCO GLICERINADO',
  price: 15,
  barcodes: [SOAP_BARCODE],
  packTypes: ['UN'],
  packQuantities: [1],
  supplierPackings: [],
  tax: null,
  margin: null,
  costWithTax: 11,
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

const supplier: TSupplier = {
  id: SUPPLIER_ID,
  tradeName: 'CONCORD',
  legalName: 'CONCORD DISTRIBUIDORA DE ALIMENTOS LTDA',
  cnpj: SUPPLIER_CNPJ,
  email: null,
  phone: null,
  observations: null,
  vrCreatedAt: '2020-01-01',
  createdAt: now,
  updatedAt: now
}

const loadInvoice = async (
  filename: string,
  products: TProduct[]
): Promise<TInvoice> => {
  const xml = (await readMockFile(filename)).toString('utf-8')
  return { ...parseNfe(xml, products), createdAt: now, updatedAt: now }
}

describe('parseNfe fiscal fields', () => {
  test('reads the operation nature, CFOP and tax-inclusive total cost', async () => {
    const invoice = await loadInvoice(BONUS_XML, [makeProduct()])

    expect(invoice.operationNature).toBe('BONIFICACAO, DOACAO OU BRINDE')
    expect(invoice.items.every((item) => item.cfop === '5910')).toBe(true)
    expect(
      invoice.items.every(
        (item) => (item.totalCost ?? 0) >= item.totalPrice - 0.01
      )
    ).toBe(true)
  })
})

describe('isBonusEntry', () => {
  test('detects bonus by CFOP 5910/6910', () => {
    expect(isBonusEntry({ operationNature: 'VENDA' }, { cfop: '6910' })).toBe(
      true
    )
  })

  test('never treats a sale CFOP as bonus, even on a bonus-named invoice', () => {
    expect(
      isBonusEntry({ operationNature: 'VENDA E BONIFICACAO' }, { cfop: '5102' })
    ).toBe(false)
  })

  test('falls back to the operation nature for other CFOPs', () => {
    expect(
      isBonusEntry(
        { operationNature: 'BONIFICACAO, DOACAO OU BRINDE' },
        { cfop: '5949' }
      )
    ).toBe(true)
    expect(isBonusEntry({ operationNature: 'REMESSA' }, { cfop: '5949' })).toBe(
      false
    )
  })
})

describe('resolvePackQuantity', () => {
  const item = { supplierProductCode: '005184', packageBarcode: null }

  test('prefers the VR packing registered for the supplier product code', () => {
    const product = makeProduct({
      supplierPackings: [
        {
          supplierId: SUPPLIER_ID,
          supplierProductCode: '5184',
          packQuantity: 12
        }
      ]
    })

    expect(resolvePackQuantity(item, product, SUPPLIER_ID)).toEqual({
      packQuantity: 12,
      source: 'supplier'
    })
  })

  test('ignores packings registered for another supplier', () => {
    const product = makeProduct({
      supplierPackings: [
        { supplierId: '999', supplierProductCode: '5184', packQuantity: 12 }
      ]
    })

    expect(resolvePackQuantity(item, product, SUPPLIER_ID)).toEqual({
      packQuantity: 1,
      source: 'default'
    })
  })

  test('falls back to the pack quantity of the invoice package barcode', () => {
    const product = makeProduct({
      barcodes: [SOAP_BARCODE, '17908324404866'],
      packQuantities: [1, 24]
    })

    expect(
      resolvePackQuantity(
        { supplierProductCode: '1', packageBarcode: '17908324404866' },
        product,
        SUPPLIER_ID
      )
    ).toEqual({ packQuantity: 24, source: 'barcode' })
  })

  test('handles products imported before the packing fields existed', () => {
    const product = makeProduct()
    delete product.packQuantities
    delete product.supplierPackings

    expect(resolvePackQuantity(item, product, SUPPLIER_ID)).toEqual({
      packQuantity: 1,
      source: 'default'
    })
  })
})

describe('getEntryUnitCost', () => {
  const sale = { operationNature: 'VENDA' }
  const product = makeProduct({
    supplierPackings: [
      { supplierId: SUPPLIER_ID, supplierProductCode: '5184', packQuantity: 6 }
    ]
  })

  const makeItem = (overrides: Partial<TInvoiceItem> = {}): TInvoiceItem => ({
    itemNumber: 1,
    supplierProductCode: '5184',
    barcode: null,
    calculatedBarcode: null,
    packageBarcode: null,
    description: '',
    unit: 'CX',
    quantity: 5,
    unitPrice: 57.16,
    totalPrice: 285.8,
    tribUnit: 'UN',
    tribQuantity: 60,
    tribUnitPrice: 4.7633333333,
    cfop: '5102',
    totalCost: 300,
    productId: product.id,
    orderId: null,
    matchStatus: 'matched',
    priceDivergence: null,
    quantityDivergence: null,
    ...overrides
  })

  test('uses the taxable quantity when the taxable unit price differs from the commercial one', () => {
    const entry = getEntryUnitCost(sale, makeItem(), product, SUPPLIER_ID)

    // Conversão do XML (60 ÷ 5 = 12) prevalece sobre a embalagem do VR (6).
    expect(entry).toMatchObject({
      source: 'trib',
      packQuantity: 12,
      unitQuantity: 60,
      needsPackReview: false
    })
    expect(entry.unitCost).toBeCloseTo(300 / 60, 6)
  })

  test('falls back to the VR packing and flags a review when both unit prices match', () => {
    const entry = getEntryUnitCost(
      sale,
      makeItem({ tribUnit: 'CX', tribQuantity: 5, tribUnitPrice: 57.16 }),
      product,
      SUPPLIER_ID
    )

    expect(entry).toMatchObject({
      source: 'supplier',
      packQuantity: 6,
      unitQuantity: 30,
      needsPackReview: true
    })
    expect(entry.unitCost).toBeCloseTo(300 / 30, 6)
  })

  test('keeps the current conversion for unit packages', () => {
    const entry = getEntryUnitCost(
      sale,
      makeItem({ unit: 'UN', unitPrice: 57.16, tribUnitPrice: 4.76 }),
      product,
      SUPPLIER_ID
    )

    expect(entry).toMatchObject({
      source: 'supplier',
      packQuantity: 6,
      needsPackReview: false
    })
  })

  test('does not flag a review on invoices without taxable fields', () => {
    const entry = getEntryUnitCost(
      sale,
      makeItem({ tribUnit: null, tribQuantity: null, tribUnitPrice: null }),
      product,
      SUPPLIER_ID
    )

    expect(entry).toMatchObject({ source: 'supplier', needsPackReview: false })
  })
})

describe('buildEntryCostMap', () => {
  test('dilutes the paid cost over the paid and bonus quantities', async () => {
    const product = makeProduct()
    const sale = await loadInvoice(SALE_XML, [product])
    const bonus = await loadInvoice(BONUS_XML, [product])
    const saleItem = sale.items.find((item) => item.productId === product.id)!

    const entryCost = buildEntryCostMap(
      [sale, bonus],
      [product],
      [supplier]
    ).get(product.id)!

    // 100 pacotes pagos + 10 bonificados; o valor da bonificação é ignorado.
    expect(entryCost.paidQuantity).toBe(100)
    expect(entryCost.bonusQuantity).toBe(10)
    expect(entryCost.hasBonus).toBe(true)
    expect(entryCost.cost).toBeCloseTo(saleItem.totalCost! / 110, 6)
  })

  test('converts the invoice quantity by the VR supplier packing', async () => {
    const product = makeProduct({
      supplierPackings: [
        {
          supplierId: SUPPLIER_ID,
          supplierProductCode: '5184',
          packQuantity: 5
        }
      ]
    })
    const sale = await loadInvoice(SALE_XML, [product])
    const saleItem = sale.items.find((item) => item.productId === product.id)!

    const entryCost = buildEntryCostMap([sale], [product], [supplier]).get(
      product.id
    )!

    expect(entryCost.paidQuantity).toBe(500)
    expect(entryCost.cost).toBeCloseTo(saleItem.totalCost! / 500, 6)
    // PT com Valor Unit. Trib. igual ao Valor Unit.: sem conversão no XML.
    expect(entryCost.needsPackReview).toBe(true)
  })

  test('has no cost when the product only had bonus entries', async () => {
    const product = makeProduct()
    const bonus = await loadInvoice(BONUS_XML, [product])

    const entryCost = buildEntryCostMap([bonus], [product], [supplier]).get(
      product.id
    )!

    expect(entryCost).toMatchObject({
      cost: null,
      paidQuantity: 0,
      bonusQuantity: 10,
      hasBonus: true
    })
  })

  test('falls back to the item total price on invoices without the tax-inclusive cost', () => {
    const product = makeProduct()
    const invoice = {
      id: 'legacy',
      supplierCnpj: SUPPLIER_CNPJ,
      items: [
        {
          productId: product.id,
          supplierProductCode: '5184',
          packageBarcode: null,
          unit: 'UN',
          quantity: 4,
          unitPrice: 10,
          totalPrice: 40
        }
      ]
    } as unknown as TInvoice

    const entryCost = buildEntryCostMap([invoice], [product], [supplier]).get(
      product.id
    )!

    expect(entryCost.cost).toBe(10)
  })
})

describe('getCostDivergence', () => {
  test('returns the percentage difference from the VR cost', () => {
    expect(getCostDivergence(12, 10)).toBeCloseTo(20)
    expect(getCostDivergence(8, 10)).toBeCloseTo(-20)
  })

  test('returns null without both costs', () => {
    expect(getCostDivergence(null, 10)).toBeNull()
    expect(getCostDivergence(10, null)).toBeNull()
    expect(getCostDivergence(10, 0)).toBeNull()
  })
})
