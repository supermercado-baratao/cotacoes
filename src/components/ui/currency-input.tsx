import { InputAdornment, TextField, type TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'
import {
  type Control,
  Controller,
  type FieldValues,
  type Path
} from 'react-hook-form'
import { IMaskInput } from 'react-imask'

type TCurrencyMaskProps = {
  onChange: (event: { target: { value: number | undefined } }) => void
  value?: number
}

const CurrencyMask = forwardRef<HTMLInputElement, TCurrencyMaskProps>(
  ({ onChange, value, ...props }, ref) => {
    return (
      <IMaskInput
        {...props}
        mask={Number}
        scale={2}
        thousandsSeparator="."
        radix=","
        mapToRadix={['.']}
        normalizeZeros
        padFractionalZeros
        unmask="typed"
        value={value?.toString() ?? ''}
        inputRef={ref}
        onAccept={(typedValue, mask) =>
          onChange({
            target: {
              value: mask.value === '' ? undefined : Number(typedValue)
            }
          })
        }
      />
    )
  }
)

type TCurrencyInputProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
} & Omit<TextFieldProps, 'name'>

export const CurrencyInput = <T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: TCurrencyInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          {...textFieldProps}
          slotProps={{
            input: {
              inputComponent: CurrencyMask as any,
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              )
            }
          }}
        />
      )}
    />
  )
}
