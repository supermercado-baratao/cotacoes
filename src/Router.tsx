import { BrowserRouter, Route, Routes } from 'react-router'

import { Products } from './pages'

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Products />} />
    </Routes>
  </BrowserRouter>
)
