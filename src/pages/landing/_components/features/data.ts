import {
  Business,
  Category,
  Inventory2,
  People,
  PriceChange,
  ReceiptLong,
  RequestQuote,
  type SvgIconComponent
} from '@mui/icons-material'

type TFeature = {
  title: string
  description: string
  icon: SvgIconComponent
}

export const features: TFeature[] = [
  {
    title: 'Cotações',
    description:
      'Compare preços entre fornecedores e feche a melhor cotação em minutos.',
    icon: RequestQuote
  },
  {
    title: 'Notas de Entrada',
    description:
      'Importe XML de notas fiscais e vincule os itens aos pedidos automaticamente.',
    icon: ReceiptLong
  },
  {
    title: 'Reajustes de Preços',
    description:
      'Acompanhe variações de preço e reajuste seu catálogo com segurança.',
    icon: PriceChange
  },
  {
    title: 'Produtos',
    description: 'Catálogo centralizado de produtos, famílias e grupos.',
    icon: Inventory2
  },
  {
    title: 'Fornecedores',
    description: 'Cadastro completo de fornecedores e seus vendedores.',
    icon: Business
  },
  {
    title: 'Vendedores',
    description: 'Histórico e organização de contatos por vendedor.',
    icon: People
  },
  {
    title: 'Famílias',
    description: 'Organize o catálogo por família para relatórios mais claros.',
    icon: Category
  }
]
