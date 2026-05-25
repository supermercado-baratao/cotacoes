import { Add, Search } from '@mui/icons-material'
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'

import * as S from './style'

type TPageHeaderProps = {
  title: string
  buttonLabel: string
  searchPlaceholder: string
  search: string
  setSearch: (search: string) => void
  handleFormOpen: () => void
}

export const PageHeader = ({
  title,
  buttonLabel,
  searchPlaceholder,
  search,
  setSearch,
  handleFormOpen
}: TPageHeaderProps) => {
  return (
    <Box component="header" sx={S.Wrapper}>
      <Typography component="h1" variant="h5">
        {title}
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={handleFormOpen}>
        {buttonLabel}
      </Button>
      <TextField
        size="small"
        placeholder={searchPlaceholder}
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
