import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import useTotals from '@/hooks/useTotals'
import type { Bill } from '@/types'

describe('useTotals Hook', () => {
  const mockBills: Bill[] = [
    {
      id: '1',
      title: 'Conta 1',
      amount: 100,
      dueDate: '2024-01-15',
      recurrence: 'MONTHLY' as const,
      paid: false,
      paidOn: null,
      category: 'utilities',
      notes: null,
      tags: []
    },
    {
      id: '2',
      title: 'Conta 2',
      amount: 200,
      dueDate: '2024-01-20',
      recurrence: 'MONTHLY' as const,
      paid: true,
      paidOn: '2024-01-20',
      category: 'food',
      notes: null,
      tags: []
    },
    {
      id: '3',
      title: 'Conta 3',
      amount: 150,
      dueDate: '2024-02-10',
      recurrence: 'MONTHLY' as const,
      paid: false,
      paidOn: null,
      category: 'transport',
      notes: null,
      tags: []
    }
  ]

  it('calculates open bills total correctly', () => {
    const { result } = renderHook(() => useTotals(mockBills))
    
    // Contas não pagas: 100 + 150 = 250
    expect(result.current.allOpen).toBe(250)
  })

  it('calculates month total correctly', () => {
    // Mock da data atual para janeiro de 2024
    vi.setSystemTime(new Date('2024-01-15'))
    const { result } = renderHook(() => useTotals(mockBills))
    
    // Contas não pagas de janeiro: 100 = 100
    expect(result.current.monthOpen).toBe(100)
  })

  it('handles empty bills array', () => {
    const { result } = renderHook(() => useTotals([]))
    
    expect(result.current.allOpen).toBe(0)
    expect(result.current.monthOpen).toBe(0)
    expect(result.current.countOpen).toBe(0)
  })

  it('counts open bills correctly', () => {
    const { result } = renderHook(() => useTotals(mockBills))
    
    // Contas não pagas: conta 1 e conta 3
    expect(result.current.countOpen).toBe(2)
  })

  it('updates when bills change', () => {
    const { result, rerender } = renderHook(
      ({ bills }) => useTotals(bills),
      { initialProps: { bills: mockBills } }
    )
    
    expect(result.current.allOpen).toBe(250)
    
    // Adiciona uma nova conta não paga
    const newBills = [...mockBills, {
      id: '4',
      title: 'Conta 4',
      amount: 75,
      dueDate: '2024-01-25',
      recurrence: 'MONTHLY' as const,
      paid: false,
      paidOn: null,
      category: 'entertainment',
      notes: null,
      tags: []
    }]
    
    rerender({ bills: newBills })
    expect(result.current.allOpen).toBe(325) // 250 + 75
  })
})
