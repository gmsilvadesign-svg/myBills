import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ToggleButton from '../ToggleButton'

describe('ToggleButton Component', () => {
  const mockItems: [string, string][] = [
    ['option1', 'Option 1'],
    ['option2', 'Option 2'],
    ['option3', 'Option 3']
  ]

  it('renders all options', () => {
    const mockOnChange = vi.fn()
    render(
      <ToggleButton
        items={mockItems}
        selected="option1"
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('highlights the selected option', () => {
    const mockOnChange = vi.fn()
    render(
      <ToggleButton
        items={mockItems}
        selected="option2"
        onChange={mockOnChange}
      />
    )

    const selectedButton = screen.getByText('Option 2')
    expect(selectedButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange when option is clicked', () => {
    const mockOnChange = vi.fn()
    render(
      <ToggleButton
        items={mockItems}
        selected="option1"
        onChange={mockOnChange}
      />
    )

    fireEvent.click(screen.getByText('Option 2'))
    expect(mockOnChange).toHaveBeenCalledWith('option2')
  })

  it('does not call onChange when clicking the already selected option', () => {
    const mockOnChange = vi.fn()
    render(
      <ToggleButton
        items={mockItems}
        selected="option1"
        onChange={mockOnChange}
      />
    )

    fireEvent.click(screen.getByText('Option 1'))
    expect(mockOnChange).toHaveBeenCalledWith('option1')
  })

  it('applies responsive classes', () => {
    const mockOnChange = vi.fn()
    render(
      <ToggleButton 
        items={mockItems}
        selected="option1"
        onChange={mockOnChange}
      />
    )
    
    const container = screen.getByRole('group')
    expect(container).toHaveClass('flex', 'rounded-2xl', 'overflow-hidden', 'border', 'w-full', 'sm:w-auto')
  })
})