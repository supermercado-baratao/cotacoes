import type { TInvoice, TInvoiceItem } from '@/models/invoice/types'
import type { TPackingDefault } from '@/models/packing-default/types'
import type { TProduct } from '@/models/product/types'
import type { TSupplier } from '@/models/supplier/types'

import { normalizeCnpj } from './formatters'
import { findPackingDefault, getInvoiceItemPacking } from './packing-defaults'

const BONUS_CFOPS = new Set(['5910', '6910'])
// Sales (5.1xx/6.1xx and, with ST, 5.4xx/6.4xx) are never a bonus, even when
// the operation nature mentions it: a mixed invoice ("venda e bonificação") has
// the right CFOP on each item.
const SALE_CFOP_PATTERN = /^[56][14]\d\d$/
const BONUS_OPERATION_NATURE_PATTERN = /BONIFICA|DOA[CÇ][AÃ]O|BRINDE/i

export const isBonusEntry = (
  invoice: Pick<TInvoice, 'operationNature'>,
  item: Pick<TInvoiceItem, 'cfop'>
): boolean => {
  const cfop = item.cfop ?? null
  if (cfop && BONUS_CFOPS.has(cfop)) return true
  if (cfop && SALE_CFOP_PATTERN.test(cfop)) return false
  return BONUS_OPERATION_NATURE_PATTERN.test(invoice.operationNature ?? '')
}

// The VR may store the external code without the leading zeros the supplier
// puts in <cProd> (or vice versa).
const normalizeSupplierProductCode = (code: string): string =>
  code
    .trim()
    .replace(/^0+(?=.)/, '')
    .toUpperCase()

export type TPackQuantitySource =
  'manual' | 'trib' | 'supplier' | 'barcode' | 'default'

export type TPackQuantity = {
  packQuantity: number
  source: TPackQuantitySource
}

// Priority: the VR packing for the supplier code (the same conversion the VR
// applies when entering the invoice) -> the pack quantity of the invoice
// barcode (produtoautomacao) -> 1.
export const resolvePackQuantity = (
  item: Pick<TInvoiceItem, 'supplierProductCode' | 'packageBarcode'>,
  product: Pick<TProduct, 'barcodes' | 'packQuantities' | 'supplierPackings'>,
  supplierId: string | null
): TPackQuantity => {
  if (supplierId && item.supplierProductCode) {
    const code = normalizeSupplierProductCode(item.supplierProductCode)
    const supplierPacking = product.supplierPackings?.find(
      (packing) =>
        packing.supplierId === supplierId &&
        normalizeSupplierProductCode(packing.supplierProductCode) === code
    )
    if (supplierPacking) {
      return { packQuantity: supplierPacking.packQuantity, source: 'supplier' }
    }
  }

  if (item.packageBarcode) {
    const index = product.barcodes.indexOf(item.packageBarcode)
    const barcodePackQuantity = product.packQuantities?.[index]
    if (index !== -1 && barcodePackQuantity && barcodePackQuantity > 1) {
      return { packQuantity: barcodePackQuantity, source: 'barcode' }
    }
  }

  return { packQuantity: 1, source: 'default' }
}

export type TEntryUnitCost = TPackQuantity & {
  isBonus: boolean
  unitQuantity: number
  // `null` for a bonus: its invoice value is not a real cost.
  unitCost: number | null
  // Commercial packing other than UN without conversion in the taxable unit
  // (same unit price): the cost depends on the registered pack quantity, which
  // probably needs checking.
  needsPackReview: boolean
}

const UNIT_PATTERN = /^UN(D|ID)?$/i

// XML values have up to 10 decimals; differences under half a cent are
// rounding, not a packing conversion.
const PRICE_EPSILON = 0.005

// A taxable unit price different from the unit price means the supplier
// converted the taxable quantity to units, which is more reliable than the VR
// packing.
const getTribPackQuantity = (item: TInvoiceItem): TPackQuantity | null => {
  if (UNIT_PATTERN.test(item.unit.trim())) return null
  const { tribQuantity, tribUnitPrice } = item
  if (
    !tribQuantity ||
    tribUnitPrice == null ||
    item.quantity <= 0 ||
    Math.abs(tribUnitPrice - item.unitPrice) < PRICE_EPSILON
  ) {
    return null
  }
  return { packQuantity: tribQuantity / item.quantity, source: 'trib' }
}

// Manually corrected packing (invoice detail or order checking) wins over the
// invoice and the VR, which are exactly what is wrong.
const getManualPackQuantity = (
  item: TInvoiceItem,
  productId: string,
  supplierId: string | null,
  packingDefaults: TPackingDefault[]
): TPackQuantity | null => {
  if (!supplierId) return null
  const packingDefault = findPackingDefault(packingDefaults, {
    supplierId,
    productId,
    packing: getInvoiceItemPacking(item.unit)
  })
  return packingDefault
    ? { packQuantity: packingDefault.packingQuantity, source: 'manual' }
    : null
}

const isPackReviewNeeded = (item: TInvoiceItem): boolean =>
  !UNIT_PATTERN.test(item.unit.trim()) &&
  item.tribUnitPrice != null &&
  Math.abs(item.tribUnitPrice - item.unitPrice) < PRICE_EPSILON

// Invoices imported before the cost with taxes fall back to the product value.
export const getItemUnitCost = (
  item: Pick<TInvoiceItem, 'quantity' | 'totalCost' | 'totalPrice'>,
  packQuantity: number
): number | null => {
  const unitQuantity = item.quantity * packQuantity
  return unitQuantity > 0
    ? (item.totalCost ?? item.totalPrice) / unitQuantity
    : null
}

export const getEntryUnitCost = (
  invoice: Pick<TInvoice, 'operationNature'>,
  item: TInvoiceItem,
  product: TProduct,
  supplierId: string | null,
  packingDefaults: TPackingDefault[]
): TEntryUnitCost => {
  const packQuantity =
    getManualPackQuantity(item, product.id, supplierId, packingDefaults) ??
    getTribPackQuantity(item) ??
    resolvePackQuantity(item, product, supplierId)
  const isBonus = isBonusEntry(invoice, item)
  const unitQuantity = item.quantity * packQuantity.packQuantity
  const unitCost = isBonus
    ? null
    : getItemUnitCost(item, packQuantity.packQuantity)

  return {
    ...packQuantity,
    isBonus,
    unitQuantity,
    unitCost,
    needsPackReview:
      packQuantity.source !== 'manual' && isPackReviewNeeded(item)
  }
}

export type TLastPaidEntry = {
  unitCost: number
  invoiceNumber: string
  supplierName: string
  emissionDate: string
}

export type TEntryCost = {
  // Paid value / total quantity received, bonus included. `null` when there is
  // only bonus (no paid entry to use as a base).
  cost: number | null
  paidEntryCount: number
  paidQuantity: number
  bonusQuantity: number
  hasBonus: boolean
  needsPackReview: boolean
  // Some entry in the period used a manually corrected packing, so the invoice
  // cost becomes the default margin cost instead of the VR cost.
  hasPackCorrection: boolean
  lastPaidEntry: TLastPaidEntry | null
}

export const buildEntryCostMap = (
  invoices: TInvoice[],
  products: TProduct[],
  suppliers: TSupplier[],
  packingDefaults: TPackingDefault[]
): Map<string, TEntryCost> => {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const supplierIdByCnpj = new Map(
    suppliers.map((supplier) => [normalizeCnpj(supplier.cnpj), supplier.id])
  )
  const totals = new Map<
    string,
    {
      paidCost: number
      paidEntryCount: number
      paidQuantity: number
      bonusQuantity: number
      needsPackReview: boolean
      hasPackCorrection: boolean
      lastPaidEntry: TLastPaidEntry | null
    }
  >()

  for (const invoice of invoices) {
    const supplierId =
      supplierIdByCnpj.get(normalizeCnpj(invoice.supplierCnpj)) ?? null

    for (const item of invoice.items) {
      const product = item.productId ? productMap.get(item.productId) : null
      if (!product) continue

      const entry = getEntryUnitCost(
        invoice,
        item,
        product,
        supplierId,
        packingDefaults
      )
      const total = totals.get(product.id) ?? {
        paidCost: 0,
        paidEntryCount: 0,
        paidQuantity: 0,
        bonusQuantity: 0,
        needsPackReview: false,
        hasPackCorrection: false,
        lastPaidEntry: null
      }
      if (entry.needsPackReview) total.needsPackReview = true
      if (entry.source === 'manual') total.hasPackCorrection = true
      if (entry.isBonus) {
        total.bonusQuantity += entry.unitQuantity
      } else if (entry.unitCost !== null) {
        total.paidCost += entry.unitCost * entry.unitQuantity
        total.paidEntryCount += 1
        total.paidQuantity += entry.unitQuantity
        if (
          !total.lastPaidEntry ||
          invoice.emissionDate > total.lastPaidEntry.emissionDate
        ) {
          total.lastPaidEntry = {
            unitCost: entry.unitCost,
            invoiceNumber: invoice.number,
            supplierName: invoice.supplierName,
            emissionDate: invoice.emissionDate
          }
        }
      }
      totals.set(product.id, total)
    }
  }

  const result = new Map<string, TEntryCost>()
  totals.forEach((total, productId) => {
    result.set(productId, {
      cost:
        total.paidQuantity > 0
          ? total.paidCost / (total.paidQuantity + total.bonusQuantity)
          : null,
      paidEntryCount: total.paidEntryCount,
      paidQuantity: total.paidQuantity,
      bonusQuantity: total.bonusQuantity,
      hasBonus: total.bonusQuantity > 0,
      needsPackReview: total.needsPackReview,
      hasPackCorrection: total.hasPackCorrection,
      lastPaidEntry: total.lastPaidEntry
    })
  })
  return result
}

// `null` without one of the costs, or with a zero VR cost (undefined
// percentage).
export const getCostDivergence = (
  entryCost: number | null,
  vrCost: number | null
): number | null => {
  if (entryCost == null || !vrCost) return null
  return ((entryCost - vrCost) / vrCost) * 100
}
