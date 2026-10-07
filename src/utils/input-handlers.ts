import { type FocusEvent } from 'react'

export const selectOnFocus = (event: FocusEvent<HTMLInputElement>) => {
  event.target.select()
}
