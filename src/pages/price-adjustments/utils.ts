import * as xlsx from 'xlsx'

import type {
  TFamily,
  TInvoice,
  TOrder,
  TPriceAdjustment,
  TPriceAdjustmentCostSource,
  TPriceAdjustmentDateRange,
  TProduct,
  TQuote,
  TSettings,
  TSupplier
} from '@/models'
import type { TCreateDataWithId } from '@/types'
import {
  evaluateMargin,
  getMarginTolerance,
  matchesSearch,
  type TMarginStatus
} from '@/utils'

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

// Mesma forma persistida em `TPriceAdjustment` (models/price-adjustment-model),
// sem os campos que só existem depois de gravar (id, timestamps).
export type TPriceAdjustmentRow = Omit<
  TPriceAdjustment,
  'id' | 'createdAt' | 'updatedAt'
>

export const parseXlsx = async (
  file: File
): Promise<TRawPriceAdjustmentRow[]> => {
  const reader = new FileReader()
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
  const workbook = xlsx.read(buffer)
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

// Formato do arquivo é "DD/MM/YYYY HH:mm:ss". Não há plugin customParseFormat
// registrado no projeto, e `dayjs`/`Date` sem ele leem "DD/MM" como "MM/DD",
// invertendo dia e mês silenciosamente — por isso o parse manual via regex.
const DATETIME_RE = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/

const toSortableDateTime = (value: string): string => {
  const match = DATETIME_RE.exec((value ?? '').trim())
  if (!match) return '0000-00-00T00:00:00'
  const [, dd, mm, yyyy, hh, min, ss] = match
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`
}

// "Data Movimento" vem como "DD/MM/YYYY - DOW" (ex: "27/07/2026 - SEG").
// Mesmo cuidado de não usar dayjs/Date direto (ver DATETIME_RE acima).
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

// O arquivo é um log de auditoria: o mesmo Código pode aparecer várias vezes
// no mesmo dia (correções sucessivas). Só a mudança mais recente interessa
// para a conferência — usa `>=` no empate para manter a última ocorrência do
// arquivo quando duas linhas têm o mesmo segundo de timestamp.
export const dedupeByLatestChange = (
  rows: TRawPriceAdjustmentRow[]
): TPriceAdjustmentFileRow[] => {
  const latestByCode = new Map<string, TPriceAdjustmentFileRow>()

  rows.forEach((raw) => {
    const code = (raw['Código'] ?? '').trim()
    if (!code) return
    const mapped = mapRawRow(raw)
    const current = latestByCode.get(code)
    if (
      !current ||
      mapped.changeDateTimeSortKey >= current.changeDateTimeSortKey
    ) {
      latestByCode.set(code, mapped)
    }
  })

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
    const item = invoice?.items.find((i) => i.orderId === order.id)
    if (item) return { unitCost: item.unitPrice, source: 'invoice' }
  }
  return { unitCost: order.price, source: 'order' }
}

// "Recente" = a cotação mais recente que teve pedido do produto (não uma
// janela de dias fixa). Nota fiscal vinculada a um pedido sempre vence sobre
// o preço do próprio pedido; múltiplos fornecedores na mesma cotação viram
// média simples.
export const resolveRecentCost = (
  productOrders: TOrder[],
  quoteById: Map<string, TQuote>,
  invoiceById: Map<string, TInvoice>,
  supplierById: Map<string, TSupplier>
): TCostResolution => {
  if (!productOrders.length) {
    return { averageCost: null, quoteDate: null, entries: [], source: 'file' }
  }

  const byQuoteId = new Map<string, TOrder[]>()
  productOrders.forEach((order) => {
    const list = byQuoteId.get(order.quoteId) ?? []
    list.push(order)
    byQuoteId.set(order.quoteId, list)
  })

  const groupsWithRef = [...byQuoteId.entries()].map(([quoteId, orders]) => {
    const quote = quoteById.get(quoteId)
    const refDate =
      quote?.date ??
      orders.reduce((max, o) => (o.date > max ? o.date : max), orders[0].date)
    const refCreatedAtMs = quote?.createdAt?.toMillis() ?? 0
    return { quoteId, orders, refDate, refCreatedAtMs }
  })

  groupsWithRef.sort((a, b) =>
    a.refDate !== b.refDate
      ? b.refDate.localeCompare(a.refDate)
      : b.refCreatedAtMs - a.refCreatedAtMs
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
    entries.reduce((sum, e) => sum + e.unitCost, 0) / entries.length

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
  const invoiceById = new Map(invoices.map((i) => [i.id, i]))
  const supplierById = new Map(suppliers.map((s) => [s.id, s]))

  // findManyByProductIds busca em chunks de até 30 ids — se `orders` vier de
  // chamadas concorrentes cujos resultados se sobrepõem, dedupe por id evita
  // inflar a contagem de fornecedores/pedidos na resolução de custo.
  const uniqueOrders = [...new Map(orders.map((o) => [o.id, o])).values()]

  const ordersByProductId = new Map<string, TOrder[]>()
  uniqueOrders.forEach((order) => {
    const list = ordersByProductId.get(order.productId) ?? []
    list.push(order)
    ordersByProductId.set(order.productId, list)
  })

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
      currentSystemPrice: product?.price ?? null,
      resolvedCost,
      costSource,
      quoteDate: resolution.quoteDate,
      supplierNames: resolution.entries.map((e) => e.supplierName),
      supplierCosts: resolution.entries.map((e) => e.unitCost),
      costDivergence:
        costSource === 'quote' ? resolvedCost - fileRow.fileCost : null
    }
    return row
  })
}

// Usa o próprio código do produto como id do documento — só existe uma
// linha por código depois do dedupe, e simplifica o "substituir tudo" do
// próximo import (o id novo já corresponde ao antigo, quando o produto
// se repete entre importações).
export const toPersistedPriceAdjustments = (
  rows: TPriceAdjustmentRow[]
): TCreateDataWithId<TPriceAdjustment>[] =>
  rows.map((row) => ({ ...row, id: row.code }))

export const filterPriceAdjustmentRows = (
  search: string,
  rows: TPriceAdjustmentRow[]
): TPriceAdjustmentRow[] =>
  rows.filter((row) => matchesSearch(search, row.code, row.description))

// Filtro de visualização pela Data Movimento de cada linha — não afeta o que
// fica salvo, só o que aparece na tela. Linha sem Data Movimento reconhecível
// não some, já que não dá pra saber se está dentro ou fora do período.
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
  targetMargin: number | null
  actualMargin: number | null
  marginGap: number | null
}

// `currentSystemPrice`/`resolvedCost` já vêm calculados na linha — só falta
// cruzar com a margem padrão do produto e a tolerância configurada.
export const attachMarginStatus = (
  rows: TPriceAdjustmentRow[],
  products: TProduct[],
  settings: TSettings | null
): TPriceAdjustmentDisplayRow[] => {
  const productById = new Map(products.map((p) => [p.id, p]))

  return rows.map((row) => {
    const product = productById.get(row.productId)
    const price = row.currentSystemPrice
    const cost = row.resolvedCost

    if (!product || product.margin == null || !price || !cost) {
      return {
        ...row,
        marginStatus: null,
        targetMargin: null,
        actualMargin: null,
        marginGap: null
      }
    }

    const actualMargin = ((price - cost) / price) * 100
    const tolerance = getMarginTolerance(settings, product.departmentId)
    const { status, marginGap } = evaluateMargin(
      product.margin,
      actualMargin,
      tolerance
    )

    return {
      ...row,
      marginStatus: status,
      targetMargin: product.margin,
      actualMargin,
      marginGap
    }
  })
}

export type TPriceAdjustmentGroup<TRow = TPriceAdjustmentRow> = {
  familyId: string | null
  familyDescription: string
  kind: 'family' | 'no-family' | 'unregistered'
  rows: TRow[]
}

const NO_FAMILY_KEY = '__no_family__'
const UNREGISTERED_KEY = '__unregistered__'

// Exibir ~2400 produtos numa lista só (ordem do arquivo) não é navegável —
// agrupa por família do catálogo. "Sem família" (produto cadastrado, sem
// família definida) e "Não cadastrado" (produto do arquivo que não existe
// no catálogo) são grupos separados: são causas diferentes de não termos
// uma família pra mostrar.
export const groupRowsByFamily = <TRow extends { productId: string }>(
  rows: TRow[],
  products: TProduct[],
  families: TFamily[]
): TPriceAdjustmentGroup<TRow>[] => {
  const productById = new Map(products.map((p) => [p.id, p]))
  const familyById = new Map(families.map((f) => [f.id, f]))

  const groups = new Map<string, TPriceAdjustmentGroup<TRow>>()
  rows.forEach((row) => {
    const product = productById.get(row.productId)
    const familyId = product?.familyId ?? null
    const key = !product ? UNREGISTERED_KEY : (familyId ?? NO_FAMILY_KEY)

    if (!groups.has(key)) {
      groups.set(key, {
        familyId,
        familyDescription: !product
          ? 'Não cadastrado'
          : familyId
            ? (familyById.get(familyId)?.description ??
              'Família não encontrada')
            : 'Sem família',
        kind: !product ? 'unregistered' : familyId ? 'family' : 'no-family',
        rows: []
      })
    }
    groups.get(key)!.rows.push(row)
  })

  // Famílias reais em ordem alfabética primeiro; "Sem família" e "Não
  // cadastrado" (nessa ordem) sempre por último, já que não são famílias de
  // verdade — misturá-las na ordenação alfabética as jogaria em qualquer
  // posição da lista.
  const kindRank: Record<TPriceAdjustmentGroup['kind'], number> = {
    family: 0,
    'no-family': 1,
    unregistered: 2
  }

  return [...groups.values()].sort((a, b) =>
    kindRank[a.kind] !== kindRank[b.kind]
      ? kindRank[a.kind] - kindRank[b.kind]
      : a.familyDescription.localeCompare(b.familyDescription)
  )
}

// Grava o Preço Venda do arquivo em todos os produtos do relatório que já
// existem no catálogo (o relatório é só leitura para o restante dos dados —
// custo real, divergência etc. —, mas o preço de venda é atualizado direto).
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

// Padrão do filtro de período: menor e maior Data Movimento entre os dados
// já salvos (não é algo digitado — é calculado a partir do próprio dado).
export const getDataDateRange = (
  priceAdjustments: TPriceAdjustment[]
): TPriceAdjustmentDateRange | null => {
  const dates = priceAdjustments
    .map((item) => item.movementDate)
    .filter((date): date is string => date !== null)
  if (!dates.length) return null

  return {
    startDate: dates.reduce((min, d) => (d < min ? d : min), dates[0]),
    endDate: dates.reduce((max, d) => (d > max ? d : max), dates[0])
  }
}
