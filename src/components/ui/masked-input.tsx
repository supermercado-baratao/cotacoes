import { TextField, type TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'
import {
  type Control,
  Controller,
  type FieldValues,
  type Path
} from 'react-hook-form'
import { IMaskInput } from 'react-imask'

type TMaskBaseProps = {
  onChange: (event: { target: { value: string } }) => void
  value?: string
}

const CnpjMask = forwardRef<HTMLInputElement, TMaskBaseProps>(
  ({ onChange, value, ...props }, ref) => (
    <IMaskInput
      {...props}
      mask="00.000.000/0000-00"
      unmask={true}
      value={value ?? ''}
      inputRef={ref}
      onAccept={(val) => onChange({ target: { value: val as string } })}
    />
  )
)

const PhoneMask = forwardRef<HTMLInputElement, TMaskBaseProps>(
  ({ onChange, value, ...props }, ref) => (
    <IMaskInput
      {...props}
      mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
      unmask={true}
      value={value ?? ''}
      inputRef={ref}
      onAccept={(val) => onChange({ target: { value: val as string } })}
    />
  )
)

type TProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
} & Omit<TextFieldProps, 'name'>

export const CnpjInput = <T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: TProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        {...textFieldProps}
        slotProps={{
          input: { inputComponent: CnpjMask as any }
        }}
      />
    )}
  />
)

export const PhoneInput = <T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: TProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        {...textFieldProps}
        slotProps={{
          input: { inputComponent: PhoneMask as any }
        }}
      />
    )}
  />
)
