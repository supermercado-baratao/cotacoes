import { Box } from '@mui/material'

import { Features } from './_components/features'
import { Footer } from './_components/footer'
import { Header } from './_components/header'
import { Hero } from './_components/hero'
import * as S from './style'

export const Landing = () => (
  <Box sx={S.Wrapper}>
    <Header />
    <Box component="main" sx={S.Main}>
      <Hero />
      <Features />
    </Box>
    <Footer />
  </Box>
)
