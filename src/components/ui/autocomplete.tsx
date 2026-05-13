import { Add } from '@mui/icons-material'
import {
  Autocomplete as MuiAutocomplete,
  Box,
  IconButton,
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

type TProps<TOption, TFieldValues extends FieldValues> = {
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
  onClickAdd?: () => void
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
  onClickAdd,
  addLabel,
  sx
}: TProps<TOption, TFieldValues>) => (
  <Box
    sx={[
      { display: 'flex', alignItems: 'flex-start', gap: 1 },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
    ]}
  >
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <MuiAutocomplete
          sx={{ flex: 1 }}
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
    {onClickAdd && (
      <Tooltip title={addLabel}>
        <IconButton onClick={onClickAdd} sx={{ mt: 1 }}>
          <Add />
        </IconButton>
      </Tooltip>
    )}
  </Box>
)
