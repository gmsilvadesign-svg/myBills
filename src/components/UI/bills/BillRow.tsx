// React
import { memo } from 'react'

// Components
import Pill from '@/components/UI/Pill'

// Utils
import {
  fmtMoney,
  fmtMoneyTruncated,
  formatDate,
  isBefore,
  ymd,
  daysDifference,
} from '@/utils/utils'

// Types
import * as Types from '@/types'

// Utility function for conditional classes
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

interface BillRowProps {
  bill: Types.Bill
  markPaid: (bill: Types.Bill, advance: boolean) => void
  unmarkPaid?: (bill: Types.Bill) => void
  paidInCurrentMonth?: boolean
  setEditing: (bill: Types.Bill) => void
  setConfirm: (confirm: Types.ConfirmState) => void
  t: Record<string, any>
  locale: string
  currency: string
  hideValues?: boolean
}

const BillRow = memo(function BillRow({
  bill,
  markPaid,
  unmarkPaid,
  setEditing,
  setConfirm,
  t,
  locale,
  currency,
  paidInCurrentMonth,
  hideValues = false,
}: BillRowProps) {
  const isPaid = !!bill.paid || !!paidInCurrentMonth
  const overdue = !isPaid && isBefore(bill.dueDate, ymd(new Date()))
  const overdueDays = overdue ? daysDifference(bill.dueDate, ymd(new Date())) : 0

  const formatValueWithTruncation = (amount: number | string) => {
    if (hideValues) {
      return "••••••"
    }
    return fmtMoneyTruncated(amount, currency, locale)
  }

  const renderStatus = () => {
    if (!isPaid && overdue) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            // Para contas atrasadas, apenas marcar como pago sem avançar
            markPaid(bill, false)
          }}
          className="px-3 py-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300 dark:hover:from-red-800/40 dark:hover:to-red-700/40 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-red-200 dark:border-red-700 min-w-[110px] text-center"
          aria-label={`${t.mark_paid}: ${bill.title}`}
          title={t.mark_paid}
        >
          {t.overdue}
        </button>
      )
    }
    if (!isPaid && !overdue) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            // Para contas pendentes, apenas marcar como pago sem avançar
            markPaid(bill, false)
          }}
          className="px-3 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-700 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-300 dark:hover:from-amber-800/40 dark:hover:to-amber-700/40 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-amber-200 dark:border-amber-700 min-w-[110px] text-center"
          aria-label={`${t.mark_paid}: ${bill.title}`}
          title={t.mark_paid}
        >
          {t.pending}
        </button>
      )
    }
    return (
      <button
        onClick={(e) => {
          if (!unmarkPaid) return
          e.preventDefault()
          unmarkPaid(bill)
        }}
        className="px-3 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300 dark:hover:from-green-800/40 dark:hover:to-green-700/40 text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-green-200 dark:border-green-700 min-w-[110px] text-center"
        aria-label={`${t.mark_unpaid || 'Desmarcar pago'}: ${bill.title}`}
        title={t.mark_unpaid || 'Desmarcar pago'}
      >
        {t.paid}
      </button>
    )
  }

  const renderActionButtons = () => (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          setEditing(bill)
        }}
        className="px-2 py-2 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        aria-label={`${t.edit} ${bill.title}`}
        title={t.edit}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault()
          setConfirm({ open: true, id: bill.id || null })
        }}
        className="px-2 py-2 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 border border-red-200 dark:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        aria-label={`${t.delete} ${bill.title}`}
        title={t.delete}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </>
  )

  // JSX da linha da conta
  return (
    <div className="py-4 px-4 hover:bg-slate-50 dark:hover:bg-[#AABBCC]/15 rounded-lg border-b border-slate-100 dark:border-[#AABBCC]/30 last:border-b-0 transition-colors duration-200">
      {/* Desktop: ordem solicitada */}
      <div className="hidden md:flex items-center gap-4">
        {/* 1) Status */}
        <div className="flex-shrink-0" role="status">{renderStatus()}</div>

        {/* 2) Categoria e Recorrência (vertical) */}
        <div className="flex flex-col gap-1">
          {/* Categoria */}
          {bill.category && (
            <Pill><span className="whitespace-nowrap">{bill.category.length > 12 ? `${bill.category.substring(0, 12)}...` : bill.category}</span></Pill>
          )}
          
          {/* Recorrência */}
          {bill.recurrence && bill.recurrence !== 'NONE' && (
            <Pill><span className="whitespace-nowrap">{t[bill.recurrence.toLowerCase()]}</span></Pill>
          )}
        </div>

        {/* 4) Título - oculto em zoom 250% */}
        <div className="min-w-0 flex-1 zoom-250:hidden">
          <span className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate block">{bill.title}</span>
        </div>

        {/* 5) Valor */}
        <div className="text-right whitespace-nowrap flex-shrink-0 max-w-[250px]">
          <div className="font-bold text-lg text-slate-900 dark:text-slate-100 max-w-[250px] truncate" title={hideValues ? "Valor oculto" : fmtMoneyTruncated(bill.amount, currency, locale)}>
            {formatValueWithTruncation(bill.amount)}
          </div>
        </div>

        {/* 6→8) Grupo à direita */}
        <div className="ml-auto flex items-center gap-2 justify-end text-right">
          {/* 6) Tempo / Data */}
          <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
            {(isPaid && bill.paidOn)
              ? `${t.paid_on} ${formatDate(bill.paidOn, locale)}`
              : overdue
              ? (t.days_overdue as (days: number) => string)(overdueDays)
              : `${t.due_on} ${formatDate(bill.dueDate, locale)}`}
          </div>
          {/* 7,8) Ações */}
          {renderActionButtons()}
        </div>
      </div>

      {/* Mobile: layout reorganizado */}
        <div className="md:hidden p-4">
          {/* Primeira linha: título e valor */}
          <div className="flex items-start justify-between mb-3">
            {/* Título */}
            <div className="flex-1 min-w-0 mr-4">
              <span className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate block" title={bill.title}>
                {bill.title.length > 50 ? `${bill.title.substring(0, 50)}...` : bill.title}
              </span>
            </div>
            
            {/* Valor */}
            <div className="text-right flex-shrink-0 max-w-[300px]">
              <div className="font-bold text-xl text-slate-900 dark:text-slate-100 max-w-[300px] overflow-hidden text-ellipsis truncate" title={hideValues ? "Valor oculto" : fmtMoneyTruncated(bill.amount, currency, locale)}>
                {formatValueWithTruncation(bill.amount)}
              </div>
            </div>
          </div>

          {/* Segunda linha: categoria/recorrência à esquerda, data no meio, botões à direita */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Categoria e Recorrência (empilhadas verticalmente) */}
              <div className="flex flex-col gap-2">
                {/* Categoria */}
                {bill.category && (
                  <Pill><span className="whitespace-nowrap text-sm">{bill.category.length > 12 ? `${bill.category.substring(0, 12)}...` : bill.category}</span></Pill>
                )}
                
                {/* Recorrência */}
                {bill.recurrence && bill.recurrence !== 'NONE' && (
                  <Pill><span className="whitespace-nowrap text-sm">{t[bill.recurrence.toLowerCase()]}</span></Pill>
                )}
              </div>

              {/* Data */}
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {(isPaid && bill.paidOn)
                  ? `${t.paid_on} ${formatDate(bill.paidOn, locale)}`
                  : formatDate(bill.dueDate, locale)}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setEditing(bill)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200 p-1"
                title={t.edit}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (isPaid && unmarkPaid) {
                    unmarkPaid(bill);
                  } else {
                    // Marcar como pago sem avançar automaticamente
                    markPaid(bill, false);
                  }
                }}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                  isPaid
                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
                title={isPaid ? t.unmark_paid : t.mark_paid}
              >
                {isPaid ? t.paid : t.mark_paid}
              </button>
            </div>
          </div>
        </div>
    </div>
  )
})

export default BillRow
