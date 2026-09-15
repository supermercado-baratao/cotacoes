import { Navigate, Outlet, Route, Routes } from 'react-router'

import { AppLayout } from '@/layout'
import { useAuthStore } from '@/stores'

import {
  Dashboard,
  Families,
  InvoiceDetail,
  Invoices,
  Landing,
  NotFound,
  PriceAdjustments,
  Products,
  Quotes,
  Sellers,
  Settings,
  Signin,
  Signup,
  Suppliers,
  VerifyEmail
} from './pages'

const PrivateRoute = () => {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/signin" replace />
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />
  return <Outlet />
}

const PublicRoute = () => {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Outlet />
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />
  return <Navigate to="/dashboard" replace />
}

const VerifyEmailRoute = () => {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/signin" replace />
  if (user.emailVerified) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export const Router = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
    </Route>
    <Route element={<VerifyEmailRoute />}>
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Route>
    <Route element={<PrivateRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/sellers" element={<Sellers />} />
        <Route path="/families" element={<Families />} />
        <Route path="/price-adjustments" element={<PriceAdjustments />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)
