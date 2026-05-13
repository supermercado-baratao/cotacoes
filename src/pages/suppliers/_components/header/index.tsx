import { Add, Search } from '@mui/icons-material'
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'

import * as S from './style'

type THeaderProps = {
  search: string
  setSearch: (search: string) => void
  handleOpenCreate: () => void
}

export const Header = ({
  search,
  setSearch,
  handleOpenCreate
}: THeaderProps) => {
  return (
    <Box component="header" sx={S.Wrapper}>
      <Typography component="h1" variant="h5">
        Fornecedores
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleOpenCreate}
      >
        Novo Fornecedor
      </Button>
      <TextField
        size="small"
        placeholder="Buscar fornecedor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }
        }}
        sx={S.SearchField}
      />
    </Box>
  )
}
