import { BrowserRouter, Route, Routes } from 'react-router'

import { AppLayout } from './components'
import { NotFound, Products } from './pages'

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/products" element={<Products />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
