import { Timestamp } from 'firebase/firestore'

// Código do produto no fornecedor (<cProd> da NF-e) e quantas unidades de
// venda cada embalagem desse código contém — vem de produtofornecedor /
// produtofornecedorcodigoexterno no VR, os mesmos dados que o VR usa pra
// converter a quantidade ao lançar a nota.
export type TSupplierPacking = {
  supplierId: string
  supplierProductCode: string
  packQuantity: number
}

// Fonte de custo usada na margem do Dashboard — cadastro do VR, médio das
// notas do período ou última nota paga.
export type TMarginCostSource = 'vr' | 'entries' | 'lastEntry'

export type TProduct = {
  id: string
  description: string
  price: number
  barcodes: string[]
  packTypes: string[]
  // Alinhado a `barcodes` (produtoautomacao.qtdembalagem). Produtos
  // importados antes da adição desses campos não os possuem no Firestore.
  packQuantities?: number[]
  supplierPackings?: TSupplierPacking[]
  tax: number | null
  margin: number | null
  costWithTax: number | null
  // Fonte escolhida no select da coluna Custo do Dashboard. `null`/ausente =
  // padrão (VR, senão médio das notas). Fica fora de
  // UPSERT_MANY_UPDATABLE_FIELDS pra sobreviver à reimportação do catálogo.
  marginCostSource?: TMarginCostSource | null
  observations: string | null
  familyId: string | null
  departmentId: string | null
  department: string
  section: string
  group: string
  stock: number
  vrCreatedAt: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
