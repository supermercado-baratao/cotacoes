import { Box } from '@mui/material'

import { Features, Footer, Header, Hero } from './_components'
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
