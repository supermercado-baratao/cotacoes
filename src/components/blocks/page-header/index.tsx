import { Add, UploadFile } from '@mui/icons-material'
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
  handleImportOpen?: () => void
}

export const PageHeader = ({
  title,
  buttonLabel,
  searchPlaceholder,
  search,
  setSearch,
  handleFormOpen,
  handleImportOpen
}: TPageHeaderProps) => {
  return (
    <Box component="header" sx={S.Wrapper}>
      <Typography component="h1" variant="h5">
        {title}
      </Typography>
      <Box sx={S.Actions}>
        {handleImportOpen && (
          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => handleImportOpen()}
          >
            Importar
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleFormOpen()}
        >
          {buttonLabel}
        </Button>
      </Box>
      <SearchInput
        placeholder={searchPlaceholder}
        value={search}
        onValueChange={setSearch}
      />
    </Box>
  )
}
