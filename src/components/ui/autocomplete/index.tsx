import { Add } from '@mui/icons-material'
import {
  Autocomplete as MuiAutocomplete,
  Box,
  Button,
  type SxProps,
  TextField,
  type Theme,
  Tooltip
} from '@mui/material'
import {
  type Control,
  Controller,
  type FieldValues,
  type Path
} from 'react-hook-form'

import * as S from './style'

type TAutocompleteProps<TOption, TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  options: TOption[]
  getOptionLabel: (option: TOption) => string
  getOptionValue: (option: TOption) => string
  label: string
  error?: boolean
  helperText?: string
  multiple?: boolean
  disableCloseOnSelect?: boolean
  handleAddClick?: () => void
  addLabel?: string
  sx?: SxProps<Theme>
}

export const Autocomplete = <TOption, TFieldValues extends FieldValues>({
  name,
  control,
  options,
  getOptionLabel,
  getOptionValue,
  label,
  error,
  helperText,
  multiple = false,
  disableCloseOnSelect,
  handleAddClick,
  addLabel,
  sx
}: TAutocompleteProps<TOption, TFieldValues>) => (
  <Box sx={[S.Wrapper, sx] as SxProps<Theme>}>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <MuiAutocomplete
          sx={S.Inner}
          multiple={multiple as true}
          disableCloseOnSelect={disableCloseOnSelect}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(opt, val) =>
            getOptionValue(opt) === getOptionValue(val)
          }
          value={
            (multiple
              ? options.filter((o) =>
                  (field.value as string[]).includes(getOptionValue(o))
                )
              : (options.find((o) => getOptionValue(o) === field.value) ??
                null)) as unknown as TOption[]
          }
          onChange={(_, selected) => {
            if (multiple) {
              field.onChange((selected as TOption[]).map(getOptionValue))
            } else {
              field.onChange(
                selected ? getOptionValue(selected as TOption) : null
              )
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={error}
              helperText={helperText}
            />
          )}
        />
      )}
    />
    {handleAddClick && (
      <Tooltip title={addLabel}>
        <Button
          variant="contained"
          color="inherit"
          onClick={handleAddClick}
          size="small"
          sx={S.AddButton}
        >
          <Add />
        </Button>
      </Tooltip>
    )}
  </Box>
)
