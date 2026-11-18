import { describe, expect, test } from 'vitest'
import * as xlsx from 'xlsx'

import { getData } from './utils'

const baseRow = {
  id_produto: '215155',
  descricaocompleta: 'SAB BARRA ASSIM 800G COCO GLICERINADO',
  datacadastro_produto: '2024-01-01',
  codigos_barras: '7908324404869|17908324404866',
  tipos_embalagem: 'UN|CX',
  departamento: 'LIMPEZA',
  secao: 'SABOES',
  grupo: 'BARRA',
  id_familia: '',
  familia: '',
  razaosocial: 'FORNECEDOR',
  nomefantasia: 'FORNECEDOR',
  telefone: '',
  datacadastro_fornecedor: '2020-01-01',
  email: '',
  precovenda: '150000',
  estoque: '10',
  custocomimposto: '110000'
}

const toFile = (rows: Record<string, string>[]): File => {
  const workbook = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(rows), 'a')
  const buffer = xlsx.write(workbook, { type: 'array', bookType: 'xlsx' })
  return new File([buffer], 'catalogo.xlsx')
}

describe('catalog import packings', () => {
  test('reads barcode pack quantities and accumulates supplier packings across rows', async () => {
    const file = toFile([
      {
        ...baseRow,
        id_fornecedor: '71',
        cnpj: '5853741000139',
        qtds_embalagem: '1|12',
        embalagens_fornecedor: '5184:1|5184CX:12.000'
      },
      {
        ...baseRow,
        id_fornecedor: '81',
        cnpj: '5967466000184',
        qtds_embalagem: '1|12',
        embalagens_fornecedor: 'ASS800:6'
      }
    ])

    const { products } = await getData(file)

    expect(products).toHaveLength(1)
    expect(products[0].packQuantities).toEqual([1, 12])
    expect(products[0].supplierPackings).toEqual([
      { supplierId: '71', supplierProductCode: '5184', packQuantity: 1 },
      { supplierId: '71', supplierProductCode: '5184CX', packQuantity: 12 },
      { supplierId: '81', supplierProductCode: 'ASS800', packQuantity: 6 }
    ])
  })

  test('accepts spreadsheets exported before the packing columns existed', async () => {
    const file = toFile([{ ...baseRow, id_fornecedor: '71', cnpj: '1' }])

    const { products } = await getData(file)

    expect(products[0].packQuantities).toEqual([])
    expect(products[0].supplierPackings).toEqual([])
  })
})
