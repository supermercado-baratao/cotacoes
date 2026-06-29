import type { TUnmatchedItem } from './match-nfe'

export const REASON_LABELS: Record<TUnmatchedItem['reason'], string> = {
  no_product: 'Produto não identificado (sem código de barras cadastrado)',
  no_supplier: 'Fornecedor não cadastrado no sistema',
  no_quote_item: 'Produto não encontrado em nenhum item da cotação',
  out_of_range: 'Data da nota fora do período desta cotação'
}
