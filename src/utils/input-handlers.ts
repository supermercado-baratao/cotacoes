import { type FocusEvent } from 'react'

export const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => {
  e.target.select()
}
