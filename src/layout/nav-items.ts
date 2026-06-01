import {
  Business,
  Category,
  Dashboard,
  Inventory2,
  People,
  RequestQuote,
  type SvgIconComponent
} from '@mui/icons-material'

type TNavItem = {
  label: string
  path: string
  icon: SvgIconComponent
}

export const navItems: TNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Dashboard },
  { label: 'Cotações', path: '/quotes', icon: RequestQuote },
  { label: 'Produtos', path: '/products', icon: Inventory2 },
  { label: 'Fornecedores', path: '/suppliers', icon: Business },
  { label: 'Vendedores', path: '/sellers', icon: People },
  { label: 'Famílias', path: '/families', icon: Category }
]
