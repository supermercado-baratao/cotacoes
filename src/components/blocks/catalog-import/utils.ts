import * as xlsx from 'xlsx'

import { type TDepartment } from '@/models/department/types'
import { type TFamily } from '@/models/family/types'
import { type TImportData } from '@/models/import/types'
import { UPSERT_MANY_UPDATABLE_FIELDS } from '@/models/product/model'
import { type TProduct, type TSupplierPacking } from '@/models/product/types'
import { type TSupplier } from '@/models/supplier/types'
import type { TCreateDataWithId } from '@/types/generics'
import { normalizeCnpj } from '@/utils/formatters'

export type TProductImportStatus = 'new' | 'changed' | 'unchanged'

type TRawRow = {
  // produto
  id_produto: string
  descricaocompleta: string
  datacadastro_produto: string
  codigos_barras: string
  tipos_embalagem: string
  // Missing in spreadsheets exported before these columns were added to the
  // query.
  qtds_embalagem?: string
  embalagens_fornecedor?: string

  // mercadologico
  departamento: string
  secao: string
  grupo: string

  // familiaproduto
  id_familia: string
  familia: string

  // fornecedor
  id_fornecedor: string
  razaosocial: string
  nomefantasia?: string
  cnpj: string
  telefone: string
  datacadastro_fornecedor: string
  email?: string

  // produtocomplemento
  precovenda: string
  estoque: string
  custocomimposto: string
}

export const parseXlsx = async (file: File): Promise<TRawRow[]> => {
  const workbook = xlsx.read(await file.arrayBuffer())
  const raw: TRawRow[] = xlsx.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]],
    { raw: false }
  )
  return raw
}

const separatePipes = (text: string): string[] => {
  return text.split('|').map((s) => s.trim())
}

// Pack quantities come as text already joined by SQL (string_agg), so they use
// the Postgres decimal point (e.g. "12" or "12.000"), without the thousands
// formatting the spreadsheet applies to numeric columns.
const parsePackQuantity = (value: string): number => Number(value.trim())

const parsePackQuantities = (row: TRawRow): number[] =>
  row.qtds_embalagem
    ? separatePipes(row.qtds_embalagem).map(
        (qty) => parsePackQuantity(qty) || 1
      )
    : []

// `embalagens_fornecedor` comes as "code:qty|code:qty" (see query.ts).
const parseSupplierPackings = (row: TRawRow): TSupplierPacking[] => {
  if (!row.embalagens_fornecedor) return []
  return separatePipes(row.embalagens_fornecedor).flatMap((entry) => {
    const separatorIndex = entry.lastIndexOf(':')
    if (separatorIndex <= 0) return []
    const supplierProductCode = entry.slice(0, separatorIndex).trim()
    const packQuantity = parsePackQuantity(entry.slice(separatorIndex + 1))
    if (!supplierProductCode || !(packQuantity > 0)) return []
    return { supplierId: row.id_fornecedor, supplierProductCode, packQuantity }
  })
}

// Departments have no external code in the file (unlike families, which have
// id_familia): the id is derived from the raw ERP description, so the same
// department is recognized on later imports even after the user renames it.
const slugifyDepartmentId = (description: string): string =>
  description
    .trim()
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '') || 'departamento'

const mapProduct = (
  row: TRawRow,
  departmentId: string | null
): TCreateDataWithId<TProduct> => ({
  id: row.id_produto,
  description: row.descricaocompleta,
  price: Number(row.precovenda) / 10_000,
  familyId: row.id_familia || null,
  departmentId,
  barcodes: separatePipes(row.codigos_barras),
  packTypes: separatePipes(row.tipos_embalagem),
  packQuantities: parsePackQuantities(row),
  supplierPackings: parseSupplierPackings(row),
  department: row.departamento,
  section: row.secao,
  group: row.grupo,
  stock: Number(row.estoque.replaceAll('.', '')) / 1000,
  vrCreatedAt: row.datacadastro_produto,
  tax: null,
  margin: null,
  costWithTax: row.custocomimposto
    ? Number(row.custocomimposto) / 10_000
    : null,
  observations: null
})

const mapFamily = (row: TRawRow): TCreateDataWithId<TFamily> => ({
  id: row.id_familia,
  description: row.familia
})

const mapSupplier = (row: TRawRow): TCreateDataWithId<TSupplier> => ({
  id: row.id_fornecedor,
  tradeName: row.nomefantasia || null,
  legalName: row.razaosocial,
  cnpj: normalizeCnpj(row.cnpj),
  email: row.email || null,
  phone: row.telefone || null,
  observations: null,
  vrCreatedAt: row.datacadastro_fornecedor
})

const isEqualValue = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length &&
      a.every((value, index) => isEqualValue(value, b[index]))
    )
  }
  return a && b && typeof a === 'object' && typeof b === 'object'
    ? JSON.stringify(a) === JSON.stringify(b)
    : a === b
}

export const getProductImportStatus = (
  incoming: TCreateDataWithId<TProduct>,
  existingById: Map<string, TProduct>
): TProductImportStatus => {
  const existing = existingById.get(incoming.id)
  if (!existing) return 'new'
  const hasChanges = UPSERT_MANY_UPDATABLE_FIELDS.some(
    (field) => !isEqualValue(incoming[field], existing[field])
  )
  return hasChanges ? 'changed' : 'unchanged'
}

// Lists every department in the file, new or not, for the preview summary. The
// caller must skip the existing ones before saving, or a manual rename is
// overwritten (see use-import-handler.ts).
export const getData = async (file: File): Promise<TImportData> => {
  const raw = await parseXlsx(file)
  const productMap = new Map<string, TCreateDataWithId<TProduct>>()
  const familyMap = new Map<string, TCreateDataWithId<TFamily>>()
  const supplierMap = new Map<string, TCreateDataWithId<TSupplier>>()
  const departmentMap = new Map<string, TCreateDataWithId<TDepartment>>()

  for (const row of raw) {
    const departmentId = row.departamento
      ? slugifyDepartmentId(row.departamento)
      : null
    if (departmentId) {
      departmentMap.set(departmentId, {
        id: departmentId,
        description: row.departamento
      })
    }
    // One row per (product x supplier): the other product fields repeat, but
    // the supplier packings must be accumulated.
    const product = mapProduct(row, departmentId)
    const previousSupplierPackings =
      productMap.get(row.id_produto)?.supplierPackings ?? []
    productMap.set(row.id_produto, {
      ...product,
      supplierPackings: [
        ...previousSupplierPackings.filter(
          (packing) => packing.supplierId !== row.id_fornecedor
        ),
        ...(product.supplierPackings ?? [])
      ]
    })
    row.id_familia && familyMap.set(row.id_familia, mapFamily(row))
    supplierMap.set(row.id_fornecedor, mapSupplier(row))
  }

  return {
    products: [...productMap.values()],
    families: [...familyMap.values()],
    suppliers: [...supplierMap.values()],
    departments: [...departmentMap.values()]
  }
}
