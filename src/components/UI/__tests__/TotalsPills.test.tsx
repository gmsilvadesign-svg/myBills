import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TotalsPills from '../TotalsPills'

// Mock do hook useTotals
vi.mock('../../../hooks/useTotals', () => ({
  default: () => ({
    allOpen: 250.50,
    monthOpen: 450.75,
    countOpen: 3
  })
}))

describe('TotalsPills Component', () => {
  const mockTotals = {
    allOpen: 250.50,
    monthOpen: 450.75,
    countOpen: 3
  }

  it('renders component without errors', () => {
    render(<TotalsPills totals={mockTotals} />)
    
    // Verifica se o componente renderiza sem erros
    expect(screen.getByText(/Abertas:/)).toBeInTheDocument()
    expect(screen.getByText(/Mês:/)).toBeInTheDocument()
  })

  it('applies responsive classes', () => {
    const { container } = render(<TotalsPills totals={mockTotals} />)
    
    const mainDiv = container.querySelector('.flex.flex-col.sm\\:flex-row')
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-1', 'sm:gap-2', 'mb-4')
  })

  it('handles empty bills array', () => {
    const emptyTotals = { allOpen: 0, monthOpen: 0, countOpen: 0 }
    render(<TotalsPills totals={emptyTotals} />)
    
    // Deve renderizar sem erros mesmo com totals vazios
    expect(screen.getByText(/Abertas:/)).toBeInTheDocument()
    expect(screen.getByText(/Mês:/)).toBeInTheDocument()
  })
})