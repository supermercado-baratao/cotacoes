import type { TInvoice, TInvoiceItem } from '@/models/invoice-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TSupplier } from '@/models/supplier-model/types'

import { normalizeCnpj } from './formatters'

// CFOPs de remessa em bonificação, doação ou brinde.
const BONUS_CFOPS = new Set(['5910', '6910'])
// Vendas (5.1xx/6.1xx e, com ST, 5.4xx/6.4xx) nunca são bonificação, mesmo
// que a natureza da operação da nota mencione — uma nota mista ("venda e
// bonificação") traz o CFOP certo em cada item.
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

// O VR pode guardar o código externo sem os zeros à esquerda que o
// fornecedor coloca no <cProd> (ou vice-versa).
const normalizeSupplierProductCode = (code: string): string =>
  code
    .trim()
    .replace(/^0+(?=.)/, '')
    .toUpperCase()

export type TPackQuantitySource = 'trib' | 'supplier' | 'barcode' | 'default'

export type TPackQuantity = {
  packQuantity: number
  source: TPackQuantitySource
}

// Quantas unidades de venda cada unidade comercial do item da nota contém.
// Prioridade: embalagem cadastrada no VR para o código do fornecedor (mesma
// conversão aplicada ao lançar a nota no VR) → quantidade da embalagem do
// código de barras da nota (produtoautomacao) → 1.
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
    if (index >= 0 && barcodePackQuantity && barcodePackQuantity > 1) {
      return { packQuantity: barcodePackQuantity, source: 'barcode' }
    }
  }

  return { packQuantity: 1, source: 'default' }
}

export type TEntryUnitCost = TPackQuantity & {
  isBonus: boolean
  // Quantidade em unidades de venda (quantidade da nota × embalagem).
  unitQuantity: number
  // Custo por unidade de venda, com impostos. `null` em bonificação — o
  // valor da nota de bonificação não é custo real.
  unitCost: number | null
  // Embalagem comercial diferente de UN sem conversão na unidade tributável
  // (Valor Unit. Trib. igual ao Valor Unit.): o custo depende da Qtd.
  // Embalagem cadastrada, que provavelmente precisa ser conferida.
  needsPackReview: boolean
}

const UNIT_PATTERN = /^UN(D|ID)?$/i

// Valores do XML vêm com até 10 casas; diferenças abaixo de meio centavo são
// arredondamento, não conversão de embalagem.
const PRICE_EPSILON = 0.005

// Embalagem comercial (CX, DP, FD...) com a unidade tributável convertida
// pelo fornecedor: Valor Unit. Trib. diferente do Valor Unit. indica que a
// Qtd. Trib. já está em unidades — mais confiável que a embalagem do VR.
const getTribPackQuantity = (item: TInvoiceItem): TPackQuantity | null => {
  if (UNIT_PATTERN.test(item.unit.trim())) return null
  const { tribQuantity, tribUnitPrice } = item
  if (!tribQuantity || tribUnitPrice == null || item.quantity <= 0) return null
  if (Math.abs(tribUnitPrice - item.unitPrice) < PRICE_EPSILON) return null
  return { packQuantity: tribQuantity / item.quantity, source: 'trib' }
}

const isPackReviewNeeded = (item: TInvoiceItem): boolean =>
  !UNIT_PATTERN.test(item.unit.trim()) &&
  item.tribUnitPrice != null &&
  Math.abs(item.tribUnitPrice - item.unitPrice) < PRICE_EPSILON

export const getEntryUnitCost = (
  invoice: Pick<TInvoice, 'operationNature'>,
  item: TInvoiceItem,
  product: TProduct,
  supplierId: string | null
): TEntryUnitCost => {
  const packQuantity =
    getTribPackQuantity(item) ?? resolvePackQuantity(item, product, supplierId)
  const isBonus = isBonusEntry(invoice, item)
  const unitQuantity = item.quantity * packQuantity.packQuantity
  // Notas importadas antes do custo com impostos caem pro valor dos produtos.
  // Com conversão pela unidade tributável, totalCost ÷ Qtd. Trib. é o Valor
  // Unit. Trib. acrescido dos impostos/despesas do item.
  const totalCost = item.totalCost ?? item.totalPrice
  const unitCost =
    isBonus || unitQuantity <= 0 ? null : totalCost / unitQuantity

  return {
    ...packQuantity,
    isBonus,
    unitQuantity,
    unitCost,
    needsPackReview: isPackReviewNeeded(item)
  }
}

// Entrada paga mais recente do produto (maior data de emissão) — alternativa
// ao custo médio quando o custo mudou dentro do período.
export type TLastPaidEntry = {
  unitCost: number
  invoiceNumber: string
  supplierName: string
  emissionDate: string
}

export type TEntryCost = {
  // Custo médio por unidade de venda: valor pago nas notas ÷ quantidade
  // total recebida, incluindo a bonificada. `null` quando só há bonificação
  // (sem entrada paga pra servir de base).
  cost: number | null
  paidEntryCount: number
  paidQuantity: number
  bonusQuantity: number
  hasBonus: boolean
  // Alguma entrada do período precisa de conferência da Qtd. Embalagem (ver
  // TEntryUnitCost.needsPackReview).
  needsPackReview: boolean
  lastPaidEntry: TLastPaidEntry | null
}

// `invoices` já deve vir filtrado pro período desejado.
export const buildEntryCostMap = (
  invoices: TInvoice[],
  products: TProduct[],
  suppliers: TSupplier[]
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
      lastPaidEntry: TLastPaidEntry | null
    }
  >()

  invoices.forEach((invoice) => {
    const supplierId =
      supplierIdByCnpj.get(normalizeCnpj(invoice.supplierCnpj)) ?? null

    invoice.items.forEach((item) => {
      const product = item.productId ? productMap.get(item.productId) : null
      if (!product) return

      const entry = getEntryUnitCost(invoice, item, product, supplierId)
      const total = totals.get(product.id) ?? {
        paidCost: 0,
        paidEntryCount: 0,
        paidQuantity: 0,
        bonusQuantity: 0,
        needsPackReview: false,
        lastPaidEntry: null
      }
      if (entry.needsPackReview) total.needsPackReview = true
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
    })
  })

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
      lastPaidEntry: total.lastPaidEntry
    })
  })
  return result
}

// Divergência percentual do custo calculado pelas notas em relação ao custo
// com imposto cadastrado no VR. `null` sem um dos dois custos (ou custo VR
// zerado, que tornaria o percentual indefinido).
export const getCostDivergence = (
  entryCost: number | null,
  vrCost: number | null
): number | null => {
  if (entryCost == null || !vrCost) return null
  return ((entryCost - vrCost) / vrCost) * 100
}
