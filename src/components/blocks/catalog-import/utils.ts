import * as xlsx from 'xlsx'

import {
  type TFamily,
  type TImportData,
  type TProduct,
  type TSupplier,
  UPSERT_MANY_UPDATABLE_FIELDS
} from '@/models'
import type { TCreateDataWithId } from '@/types'
import { normalizeCnpj } from '@/utils'

export type TProductImportStatus = 'new' | 'changed' | 'unchanged'

type TRawRow = {
  // produto
  id_produto: string
  descricaocompleta: string
  datacadastro_produto: string
  codigos_barras: string
  tipos_embalagem: string

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
  nomefantasia: string
  cnpj: string
  telefone: string
  datacadastro_fornecedor: string
  email?: string

  // produtocomplemento
  precovenda: string
  estoque: string
}

export const parseXlsx = async (file: File): Promise<TRawRow[]> => {
  const reader = new FileReader()
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
  const workbook = xlsx.read(buffer)
  const raw: TRawRow[] = xlsx.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]],
    { raw: false }
  )
  return raw
}

const separatePipes = (text: string): string[] => {
  return text.split('|').map((s) => s.trim())
}

const mapProduct = (row: TRawRow): TCreateDataWithId<TProduct> => ({
  id: row.id_produto,
  description: row.descricaocompleta,
  price: Number(row.precovenda) / 10000,
  familyId: row.id_familia || null,
  barcodes: separatePipes(row.codigos_barras),
  packTypes: separatePipes(row.tipos_embalagem),
  department: row.departamento,
  section: row.secao,
  group: row.grupo,
  stock: Number(row.estoque.replace(/\./g, '')) / 1000,
  vrCreatedAt: row.datacadastro_produto,
  tax: null,
  margin: null,
  observations: null
})

const mapFamily = (row: TRawRow): TCreateDataWithId<TFamily> => ({
  id: row.id_familia,
  description: row.familia
})

const mapSupplier = (row: TRawRow): TCreateDataWithId<TSupplier> => ({
  id: row.id_fornecedor,
  tradeName: row.nomefantasia,
  legalName: row.razaosocial,
  cnpj: normalizeCnpj(row.cnpj),
  email: row.email || null,
  phone: row.telefone || null,
  observations: null,
  vrCreatedAt: row.datacadastro_fornecedor
})

const isEqualValue = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i])
  }
  return a === b
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

export const getData = async (file: File): Promise<TImportData> => {
  const raw = await parseXlsx(file)
  const productMap = new Map<string, TCreateDataWithId<TProduct>>()
  const familyMap = new Map<string, TCreateDataWithId<TFamily>>()
  const supplierMap = new Map<string, TCreateDataWithId<TSupplier>>()

  raw.forEach((row) => {
    productMap.set(row.id_produto, mapProduct(row))
    row.id_familia && familyMap.set(row.id_familia, mapFamily(row))
    supplierMap.set(row.id_fornecedor, mapSupplier(row))
  })

  return {
    products: [...productMap.values()],
    families: [...familyMap.values()],
    suppliers: [...supplierMap.values()]
  }
}
