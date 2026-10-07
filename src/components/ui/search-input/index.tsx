import { Search } from '@mui/icons-material'
import {
  InputAdornment,
  type SxProps,
  TextField,
  type Theme
} from '@mui/material'

import * as S from './style'

type TSearchInputProps = {
  placeholder: string
  value: string
  onValueChange: (value: string) => void
  sx?: SxProps<Theme>
}

export const SearchInput = ({
  placeholder,
  value,
  onValueChange,
  sx
}: TSearchInputProps) => {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          )
        }
      }}
      sx={[S.Wrapper, sx] as SxProps<Theme>}
    />
  )
}
