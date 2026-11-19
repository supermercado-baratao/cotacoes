import * as xlsx from 'xlsx'

import type { TFamily } from '@/models/family/types'
import type { TInvoice } from '@/models/invoice/types'
import type { TOrder } from '@/models/order/types'
import type {
  TPriceAdjustment,
  TPriceAdjustmentCostSource,
  TPriceAdjustmentDateRange
} from '@/models/price-adjustment/types'
import type { TProduct } from '@/models/product/types'
import type { TQuote } from '@/models/quote/types'
import type { TSettings } from '@/models/settings/types'
import type { TSupplier } from '@/models/supplier/types'
import type { TCreateDataWithId } from '@/types/generics'
import { groupBy } from '@/utils/group-by'
import {
  evaluateMargin,
  getMarginTolerance,
  type TMarginStatus
} from '@/utils/margin'
import { matchesSearch } from '@/utils/search'

export type TRawPriceAdjustmentRow = {
  Código: string
  Descrição: string
  'Preço Ant.': string
  'Custo c/ Imposto': string
  'Preço Venda': string
  'Data Últ. Entrada': string
  'Data/Hora': string
  Usuário: string
  'Data Movimento': string
}

export type TPriceAdjustmentFileRow = {
  code: string
  description: string
  previousPrice: number
  fileCost: number
  newSalePrice: number
  lastEntryDate: string | null
  changeDateTime: string
  changeDateTimeSortKey: string
  movementDate: string | null
  user: string
}

export type TCostResolutionEntry = {
  supplierId: string
  supplierName: string
  unitCost: number
  source: 'invoice' | 'order'
}

export type TCostResolution = {
  averageCost: number | null
  quoteDate: string | null
  entries: TCostResolutionEntry[]
  source: TPriceAdjustmentCostSource
}

export type TPriceAdjustmentRow = Omit<
  TPriceAdjustment,
  'id' | 'createdAt' | 'updatedAt'
>

export const parseXlsx = async (
  file: File
): Promise<TRawPriceAdjustmentRow[]> => {
  const workbook = xlsx.read(await file.arrayBuffer())
  return xlsx.utils.sheet_to_json<TRawPriceAdjustmentRow>(
    workbook.Sheets[workbook.SheetNames[0]],
    { raw: false }
  )
}

const parseFileNumber = (value: string | undefined): number => {
  if (!value) return 0
  const n = Number(value.trim().replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

// The format is "DD/MM/YYYY HH:mm:ss". Without the customParseFormat plugin,
// dayjs/Date read "DD/MM" as "MM/DD", silently swapping day and month.
const DATETIME_RE = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/

const sortDates = (dates: string[]): string[] =>
  dates.toSorted((a, b) => a.localeCompare(b))

const getLatestDate = (dates: string[]): string =>
  sortDates(dates)[dates.length - 1]

const toSortableDateTime = (value: string): string => {
  const match = DATETIME_RE.exec((value ?? '').trim())
  if (!match) return '0000-00-00T00:00:00'
  const [, dd, mm, yyyy, hh, min, ss] = match
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`
}

// "Data Movimento" comes as "DD/MM/YYYY - DOW" (e.g. "27/07/2026 - SEG");
// parsed by hand for the same reason as DATETIME_RE.
const MOVEMENT_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})/

const parseMovementDate = (value: string | undefined): string | null => {
  const match = MOVEMENT_DATE_RE.exec((value ?? '').trim())
  if (!match) return null
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

const mapRawRow = (row: TRawPriceAdjustmentRow): TPriceAdjustmentFileRow => ({
  code: (row['Código'] ?? '').trim(),
  description: row['Descrição'] ?? '',
  previousPrice: parseFileNumber(row['Preço Ant.']),
  fileCost: parseFileNumber(row['Custo c/ Imposto']),
  newSalePrice: parseFileNumber(row['Preço Venda']),
  lastEntryDate: row['Data Últ. Entrada']?.trim() || null,
  changeDateTime: row['Data/Hora'] ?? '',
  changeDateTimeSortKey: toSortableDateTime(row['Data/Hora']),
  movementDate: parseMovementDate(row['Data Movimento']),
  user: row['Usuário'] ?? ''
})

// The file is an audit log: the same code can show up several times on the same
// day (successive corrections). `>=` keeps the last occurrence when two rows
// share the same second.
export const dedupeByLatestChange = (
  rows: TRawPriceAdjustmentRow[]
): TPriceAdjustmentFileRow[] => {
  const latestByCode = new Map<string, TPriceAdjustmentFileRow>()

  for (const raw of rows) {
    const code = (raw['Código'] ?? '').trim()
    if (!code) continue
    const mapped = mapRawRow(raw)
    const current = latestByCode.get(code)
    if (
      !current ||
      mapped.changeDateTimeSortKey >= current.changeDateTimeSortKey
    ) {
      latestByCode.set(code, mapped)
    }
  }

  return [...latestByCode.values()]
}

export const getFileRows = async (
  file: File
): Promise<TPriceAdjustmentFileRow[]> =>
  dedupeByLatestChange(await parseXlsx(file))

const resolveOrderUnitCost = (
  order: TOrder,
  invoiceById: Map<string, TInvoice>
): { unitCost: number; source: 'invoice' | 'order' } => {
  if (order.invoiceId) {
    const invoice = invoiceById.get(order.invoiceId)
    const item = invoice?.items.find((item) => item.orderId === order.id)
    if (item) return { unitCost: item.unitPrice, source: 'invoice' }
  }
  return { unitCost: order.price, source: 'order' }
}

// "Recent" = the latest quote with an order for the product, not a fixed window
// of days. An invoice linked to an order always wins over the order price;
// several suppliers in the same quote are averaged.
export const resolveRecentCost = (
  productOrders: TOrder[],
  quoteById: Map<string, TQuote>,
  invoiceById: Map<string, TInvoice>,
  supplierById: Map<string, TSupplier>
): TCostResolution => {
  if (productOrders.length === 0) {
    return { averageCost: null, quoteDate: null, entries: [], source: 'file' }
  }

  const byQuoteId = groupBy(productOrders, (order) => order.quoteId)

  const groupsWithRef = [...byQuoteId].map(([quoteId, orders]) => {
    const quote = quoteById.get(quoteId)
    const refDate =
      quote?.date ?? getLatestDate(orders.map((order) => order.date))
    const refCreatedAtMs = quote?.createdAt?.toMillis() ?? 0
    return { quoteId, orders, refDate, refCreatedAtMs }
  })

  groupsWithRef.sort((a, b) =>
    a.refDate === b.refDate
      ? b.refCreatedAtMs - a.refCreatedAtMs
      : b.refDate.localeCompare(a.refDate)
  )
  const chosen = groupsWithRef[0]

  const entries: TCostResolutionEntry[] = chosen.orders.map((order) => {
    const { unitCost, source } = resolveOrderUnitCost(order, invoiceById)
    return {
      supplierId: order.supplierId,
      supplierName:
        supplierById.get(order.supplierId)?.tradeName ?? order.supplierId,
      unitCost,
      source
    }
  })

  const averageCost =
    entries.reduce((sum, entry) => sum + entry.unitCost, 0) / entries.length

  return { averageCost, quoteDate: chosen.refDate, entries, source: 'quote' }
}

export const crossReferenceRows = (
  fileRows: TPriceAdjustmentFileRow[],
  products: TProduct[],
  orders: TOrder[],
  quotes: TQuote[],
  invoices: TInvoice[],
  suppliers: TSupplier[]
): TPriceAdjustmentRow[] => {
  const productById = new Map(products.map((p) => [p.id, p]))
  const quoteById = new Map(quotes.map((q) => [q.id, q]))
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]))
  const supplierById = new Map(suppliers.map((s) => [s.id, s]))

  // findManyByProductIds fetches in chunks of 30 ids, and concurrent calls can
  // overlap: deduping by id keeps the supplier/order count from inflating.
  const uniqueOrders = [...new Map(orders.map((o) => [o.id, o])).values()]

  const ordersByProductId = groupBy(uniqueOrders, (order) => order.productId)

  return fileRows.map((fileRow) => {
    const product = productById.get(fileRow.code) ?? null
    const productOrders = ordersByProductId.get(fileRow.code) ?? []
    const resolution = resolveRecentCost(
      productOrders,
      quoteById,
      invoiceById,
      supplierById
    )

    const resolvedCost = resolution.averageCost ?? fileRow.fileCost
    const costSource = resolution.source

    const row: TPriceAdjustmentRow = {
      code: fileRow.code,
      description: fileRow.description,
      previousPrice: fileRow.previousPrice,
      fileCost: fileRow.fileCost,
      newSalePrice: fileRow.newSalePrice,
      lastEntryDate: fileRow.lastEntryDate,
      changeDateTime: fileRow.changeDateTime,
      movementDate: fileRow.movementDate,
      user: fileRow.user,
      productId: fileRow.code,
      productFound: !!product,
      resolvedCost,
      costSource,
      quoteDate: resolution.quoteDate,
      supplierNames: resolution.entries.map((entry) => entry.supplierName),
      supplierCosts: resolution.entries.map((entry) => entry.unitCost),
      costDivergence:
        costSource === 'quote' ? resolvedCost - fileRow.fileCost : null
    }
    return row
  })
}

// The product code is the document id: there is one row per code after dedupe,
// and the next import replaces the previous one in place.
export const toPersistedPriceAdjustments = (
  rows: TPriceAdjustmentRow[]
): TCreateDataWithId<TPriceAdjustment>[] =>
  rows.map((row) => ({ ...row, id: row.code }))

export const filterPriceAdjustmentRows = (
  search: string,
  rows: TPriceAdjustmentRow[]
): TPriceAdjustmentRow[] =>
  rows.filter((row) => matchesSearch(search, row.code, row.description))

// A row without a recognizable Data Movimento stays, since there is no way to
// tell whether it is within the period.
export const filterRowsByMovementDate = (
  rows: TPriceAdjustmentRow[],
  dateRange: TPriceAdjustmentDateRange | null
): TPriceAdjustmentRow[] => {
  if (!dateRange) return rows
  return rows.filter(
    (row) =>
      row.movementDate === null ||
      (row.movementDate >= dateRange.startDate &&
        row.movementDate <= dateRange.endDate)
  )
}

export type TPriceAdjustmentDisplayRow = TPriceAdjustmentRow & {
  marginStatus: TMarginStatus | null
  actualMargin: number | null
  marginGap: number | null
}

// Uses the cost with tax registered on the product (custocomimposto), not the
// row `resolvedCost` (specific to checking the REP against quotes/orders) nor
// an invoice average (the quantity per invoice is not reliable enough).
// `newSalePrice` already is the current product price, since the import writes
// it to `product.price`.
export const attachMarginStatus = (
  rows: TPriceAdjustmentRow[],
  products: TProduct[],
  settings: TSettings | null
): TPriceAdjustmentDisplayRow[] => {
  const productById = new Map(products.map((p) => [p.id, p]))

  return rows.map((row) => {
    const product = productById.get(row.productId)
    const price = row.newSalePrice
    const cost = product ? product.costWithTax : null

    if (!product || !price || cost == null) {
      return {
        ...row,
        marginStatus: null,
        actualMargin: null,
        marginGap: null
      }
    }

    const actualMargin = ((price - cost) / price) * 100
    const tolerance = getMarginTolerance(settings, product.departmentId)
    const { status, marginGap } = evaluateMargin(actualMargin, tolerance)

    return {
      ...row,
      marginStatus: status,
      actualMargin,
      marginGap
    }
  })
}

// Previous and current prices come from the REP and should match across a
// family: a divergence means a wrong family registration, not an expected
// variation.
export const hasDivergentFamilyPrices = (
  rows: Pick<TPriceAdjustmentRow, 'previousPrice' | 'newSalePrice'>[]
): boolean => {
  const [first, ...rest] = rows
  if (!first) return false
  return rest.some(
    (row) =>
      row.previousPrice !== first.previousPrice ||
      row.newSalePrice !== first.newSalePrice
  )
}

// Unlike the prices, the margin depends on the real cost of each product, so
// the family result can be "mixed".
export const getFamilyMarginStatus = (
  rows: Pick<TPriceAdjustmentDisplayRow, 'marginStatus'>[]
): TMarginStatus | 'mixed' | null => {
  const statuses = new Set(
    rows
      .map((row) => row.marginStatus)
      .filter((status): status is TMarginStatus => status !== null)
  )
  if (statuses.size === 0) return null
  return statuses.size > 1 ? 'mixed' : [...statuses][0]
}

export type TPriceAdjustmentGroup<TRow = TPriceAdjustmentRow> = {
  familyId: string | null
  familyDescription: string
  kind: 'family' | 'no-family' | 'unregistered'
  rows: TRow[]
}

const NO_FAMILY_KEY = '__no_family__'
const UNREGISTERED_KEY = '__unregistered__'

// "Sem família" (registered product without a family) and "Não cadastrado"
// (product missing from the catalog) are separate groups: they are different
// reasons for not having a family to show.
export const groupRowsByFamily = <TRow extends { productId: string }>(
  rows: TRow[],
  products: TProduct[],
  families: TFamily[]
): TPriceAdjustmentGroup<TRow>[] => {
  const productById = new Map(products.map((p) => [p.id, p]))
  const familyById = new Map(families.map((f) => [f.id, f]))

  const groups = new Map<string, TPriceAdjustmentGroup<TRow>>()
  for (const row of rows) {
    const product = productById.get(row.productId)
    const familyId = product?.familyId ?? null
    const key = product ? (familyId ?? NO_FAMILY_KEY) : UNREGISTERED_KEY

    if (!groups.has(key)) {
      groups.set(key, {
        familyId,
        familyDescription: product
          ? familyId
            ? (familyById.get(familyId)?.description ??
              'Família não encontrada')
            : 'Sem família'
          : 'Não cadastrado',
        kind: product ? (familyId ? 'family' : 'no-family') : 'unregistered',
        rows: []
      })
    }
    groups.get(key)!.rows.push(row)
  }

  // Real families first, alphabetically; "Sem família" and "Não cadastrado"
  // always last, since sorting them alphabetically would put them anywhere in
  // the list.
  const kindRank: Record<TPriceAdjustmentGroup['kind'], number> = {
    family: 0,
    'no-family': 1,
    unregistered: 2
  }

  return [...groups.values()].toSorted((a, b) =>
    kindRank[a.kind] === kindRank[b.kind]
      ? a.familyDescription.localeCompare(b.familyDescription)
      : kindRank[a.kind] - kindRank[b.kind]
  )
}

export const getProductPriceUpdates = (
  fileRows: TPriceAdjustmentFileRow[],
  products: TProduct[]
): TProduct[] => {
  const productById = new Map(products.map((p) => [p.id, p]))
  return fileRows
    .map((row) => {
      const product = productById.get(row.code)
      return product ? { ...product, price: row.newSalePrice } : null
    })
    .filter((update): update is TProduct => update !== null)
}

export const getDataDateRange = (
  priceAdjustments: TPriceAdjustment[]
): TPriceAdjustmentDateRange | null => {
  const dates = priceAdjustments
    .map((item) => item.movementDate)
    .filter((date): date is string => date !== null)
  if (dates.length === 0) return null

  const sortedDates = sortDates(dates)
  return { startDate: sortedDates[0], endDate: sortedDates.at(-1)! }
}
