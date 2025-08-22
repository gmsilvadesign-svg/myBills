import { describe, it, expect } from 'vitest'
import {
  fmtMoney,
  ymd,
  parseDate,
  isBefore,
  daysInMonth,
  occurrencesForBillInMonth
} from '../utils'

describe('Utils Functions', () => {
  describe('fmtMoney', () => {
    it('formats currency correctly', () => {
      expect(fmtMoney(100)).toMatch(/R\$\s*100,00/)
      expect(fmtMoney(1234.56)).toMatch(/R\$\s*1\.234,56/)
    })

    it('handles zero values', () => {
      expect(fmtMoney(0)).toMatch(/R\$\s*0,00/)
    })

    it('handles negative values', () => {
      expect(fmtMoney(-100, 'BRL', 'pt-BR')).toMatch(/-R\$\s*100,00/)
    })
  })

  describe('ymd', () => {
    it('formats date correctly', () => {
      const date = new Date(2024, 0, 15) // Evita problemas de timezone
      expect(ymd(date)).toBe('2024-01-15')
    })

    it('handles single digit months and days', () => {
      const date = new Date(2024, 2, 5) // Março = 2
      expect(ymd(date)).toBe('2024-03-05')
    })


  })

  describe('parseDate', () => {
    it('parses YYYY-MM-DD string to Date', () => {
      const result = parseDate('2024-01-15')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // Janeiro é 0
      expect(result.getDate()).toBe(15)
    })

    it('handles invalid date strings', () => {
      const result = parseDate('invalid-date')
      expect(isNaN(result.getTime())).toBe(true)
    })
  })

  describe('isBefore', () => {
    it('returns true when first date is before second', () => {
      expect(isBefore('2024-01-15', '2024-01-16')).toBe(true)
      expect(isBefore('2024-01-15', '2024-02-15')).toBe(true)
      expect(isBefore('2023-12-31', '2024-01-01')).toBe(true)
    })

    it('returns false when first date is after second', () => {
      expect(isBefore('2024-01-16', '2024-01-15')).toBe(false)
      expect(isBefore('2024-02-15', '2024-01-15')).toBe(false)
    })

    it('returns false when dates are equal', () => {
      expect(isBefore('2024-01-15', '2024-01-15')).toBe(false)
    })
  })

  describe('daysInMonth', () => {
    it('returns correct number of days for different months', () => {
      expect(daysInMonth(2024, 0)).toBe(31) // Janeiro
      expect(daysInMonth(2024, 1)).toBe(29) // Fevereiro (ano bissexto)
      expect(daysInMonth(2023, 1)).toBe(28) // Fevereiro (ano normal)
      expect(daysInMonth(2024, 3)).toBe(30) // Abril
    })
  })

  describe('occurrencesForBillInMonth', () => {
    const mockBill = {
      id: '1',
      title: 'Test Bill',
      amount: 100,
      dueDate: '2024-01-15',
      recurrence: 'MONTHLY' as const,
      paid: false,
      paidOn: null,
      category: 'utilities',
      notes: null,
      tags: []
    }

    it('calculates monthly recurrence correctly', () => {
      const result = occurrencesForBillInMonth(mockBill, 2024, 0) // Janeiro = 0
      expect(result).toHaveLength(1)
      expect(result[0]).toBe('2024-01-15')
    })

    it('handles one-time bills', () => {
      const oneTimeBill = { ...mockBill, recurrence: 'NONE' as const }
      const result = occurrencesForBillInMonth(oneTimeBill, 2024, 0) // Janeiro = 0
      expect(result).toHaveLength(1)
    })
  })
})