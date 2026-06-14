import * as xlsx from 'xlsx'

import type { TFamily, TImportData, TProduct, TSupplier } from '@/models'
import type { TCreateData } from '@/types'

type TRawRow = {
  id_produto: string
  descricaocompleta: string
  id_familia_preco?: string
  familia_preco?: string
  id_fornecedor: string
  razaosocial: string
  nomefantasia: string
  cnpj: string
  precovenda: string
}

export const parseXlsx = async (file: File): Promise<TImportData> => {
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

  const familyMap = new Map<string, TCreateData<TFamily>>()
  const supplierMap = new Map<string, TCreateData<TSupplier>>()

  const products: TCreateData<TProduct>[] = raw.map((row) => {
    if (
      row.id_familia_preco &&
      row.familia_preco &&
      !familyMap.has(row.id_familia_preco)
    ) {
      familyMap.set(row.id_familia_preco, {
        vrId: row.id_familia_preco,
        description: row.familia_preco
      })
    }

    if (!supplierMap.has(row.id_fornecedor)) {
      supplierMap.set(row.id_fornecedor, {
        vrId: row.id_fornecedor,
        tradeName: row.nomefantasia,
        legalName: row.razaosocial,
        cnpj: row.cnpj,
        email: null,
        phone: null
      })
    }

    return {
      vrId: row.id_produto,
      description: row.descricaocompleta,
      price: Number(row.precovenda) / 10000,
      familyId: row.id_familia_preco || null,
      supplierIds: [row.id_fornecedor],
      barcode: null,
      tax: null,
      margin: null,
      observations: null,
      groupId: null
    }
  })

  return {
    products,
    families: [...familyMap.values()],
    suppliers: [...supplierMap.values()]
  }
}
