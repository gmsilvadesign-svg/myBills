import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Pill from '@/components/UI/Pill'

describe('Pill Component', () => {
  it('renders with text content', () => {
    render(<Pill>Test Content</Pill>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies tone-specific styles', () => {
    render(<Pill tone="green">Test</Pill>)
    const pill = screen.getByText('Test')
    expect(pill).toHaveClass('bg-green-100', 'text-green-700')
  })

  it('renders with default styling classes', () => {
    render(<Pill>Test</Pill>)
    const pill = screen.getByText('Test')
    expect(pill).toHaveClass('px-2', 'py-1', 'text-xs', 'rounded-full')
  })

  it('handles empty content', () => {
    const { container } = render(<Pill></Pill>)
    const pill = container.firstChild
    expect(pill).toBeInTheDocument()
    expect(pill).toBeEmptyDOMElement()
  })

  it('renders with different content types', () => {
    render(
      <Pill>
        <span>Nested Content</span>
      </Pill>
    )
    expect(screen.getByText('Nested Content')).toBeInTheDocument()
  })
})
