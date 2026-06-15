import {
  Business,
  Category,
  Dashboard,
  Folder,
  Inventory2,
  People,
  ReceiptLong,
  RequestQuote,
  type SvgIconComponent,
  UploadFile
} from '@mui/icons-material'

type TNavItem = {
  label: string
  path: string
  icon: SvgIconComponent
}

export const navItems: TNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Dashboard },
  { label: 'Cotações', path: '/quotes', icon: RequestQuote },
  { label: 'Conferência', path: '/invoices', icon: ReceiptLong },
  { label: 'Produtos', path: '/products', icon: Inventory2 },
  { label: 'Fornecedores', path: '/suppliers', icon: Business },
  { label: 'Vendedores', path: '/sellers', icon: People },
  { label: 'Famílias', path: '/families', icon: Category },
  { label: 'Grupos', path: '/groups', icon: Folder },
  { label: 'Importação', path: '/import', icon: UploadFile }
]
