import { FilePresent } from '@mui/icons-material'
import { Button, Chip, Paper, Stack, Typography } from '@mui/material'

import type { TImportData } from '@/models'

import * as S from './style'

type THeaderProps = {
  fileName: string
  importData: TImportData
  selectedIds: string[]
  handleRemove: () => void
}

export const Header = ({
  fileName,
  importData,
  handleRemove
}: THeaderProps) => (
  <Paper sx={S.Wrapper}>
    <FilePresent color="primary" />
    <Typography sx={{ flex: 1 }} variant="body1">
      {fileName}
    </Typography>
    <Stack direction="row" sx={{ gap: 1 }}>
      <Chip
        label={`${importData.products.length} produtos`}
        color="primary"
        size="small"
        variant="outlined"
      />
      <Chip
        label={`${importData.families.length} famílias`}
        size="small"
        variant="outlined"
      />
      <Chip
        label={`${importData.suppliers.length} fornecedores`}
        size="small"
        variant="outlined"
      />
    </Stack>
    <Button size="small" color="error" onClick={handleRemove}>
      Remover
    </Button>
  </Paper>
)
