import { BrowserRouter, Route, Routes } from 'react-router'

import { AppLayout } from './components'
import { Families, NotFound, Products, Sellers, Suppliers } from './pages'

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/sellers" element={<Sellers />} />
        <Route path="/families" element={<Families />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
