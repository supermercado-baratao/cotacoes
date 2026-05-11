import {
  Business,
  Category,
  Inventory2,
  type SvgIconComponent
} from '@mui/icons-material'

type TNavItem = {
  label: string
  path: string
  icon: SvgIconComponent
}

export const navItems: TNavItem[] = [
  { label: 'Produtos', path: '/products', icon: Inventory2 },
  { label: 'Fornecedores', path: '/suppliers', icon: Business },
  { label: 'Famílias', path: '/families', icon: Category }
]
