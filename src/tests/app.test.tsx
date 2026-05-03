import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../App'

describe('App', () => {
  it('Update counter after click button', () => {
    render(<App />)

    const button = screen.getByRole('button', { name: 'Count is 0' })

    fireEvent.click(button)

    expect(screen.getByText('Count is 1')).toBeTruthy()
  })
})
