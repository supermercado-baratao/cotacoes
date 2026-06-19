import * as xlsx from 'xlsx'

import type { TFamily, TImportData, TProduct, TSupplier } from '@/models'
import type { TCreateDataWithId } from '@/types'

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

  const productMap = new Map<string, TCreateDataWithId<TProduct>>()
  const familyMap = new Map<string, TCreateDataWithId<TFamily>>()
  const supplierMap = new Map<string, TCreateDataWithId<TSupplier>>()

  raw.forEach((row) => {
    if (!row.id_produto) return

    const supplierId = row.id_fornecedor || null
    const existing = productMap.get(row.id_produto)

    if (existing) {
      if (supplierId) {
        const merged = new Set([...existing.supplierIds, supplierId])
        productMap.set(row.id_produto, {
          ...existing,
          supplierIds: [...merged]
        })
      }
    } else {
      productMap.set(row.id_produto, {
        id: row.id_produto,
        description: row.descricaocompleta,
        price: Number(row.precovenda) / 10000,
        familyId: row.id_familia_preco || null,
        supplierIds: supplierId ? [supplierId] : [],
        barcode: null,
        tax: null,
        margin: null,
        observations: null
      })
    }

    if (
      row.id_familia_preco &&
      row.familia_preco &&
      !familyMap.has(row.id_familia_preco)
    ) {
      familyMap.set(row.id_familia_preco, {
        id: row.id_familia_preco,
        description: row.familia_preco
      })
    }

    if (supplierId && !supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        id: supplierId,
        tradeName: row.nomefantasia,
        legalName: row.razaosocial,
        cnpj: row.cnpj,
        email: null,
        phone: null
      })
    }
  })

  return {
    products: [...productMap.values()],
    families: [...familyMap.values()],
    suppliers: [...supplierMap.values()]
  }
}
