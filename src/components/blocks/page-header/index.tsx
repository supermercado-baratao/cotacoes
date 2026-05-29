import { Add } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'

import { SearchInput } from '../../ui/search-input'
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
      <SearchInput
        placeholder={searchPlaceholder}
        value={search}
        onValueChange={setSearch}
      />
    </Box>
  )
}
