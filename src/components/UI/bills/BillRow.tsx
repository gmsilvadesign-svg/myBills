// React
import { memo } from 'react'

// Components
import Pill from '@/components/UI/Pill'

// Utils
import {
  fmtMoneyTruncated,
  formatDate,
  isBefore,
  ymd,
  daysDifference,
} from '@/utils/utils'

// Types
import * as Types from '@/types'
import { TranslationDictionary } from '@/constants/translation'

// Utility function for conditional classes
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

type BillOccurrenceMeta = {
  virtual: boolean;
  timeRelation: "past" | "current" | "future";
  occurrenceDate: string;
  originalDueDate: string;
  displayKey: string;
  source: Types.Bill;
};

interface BillRowProps {
  bill: Types.Bill
  markPaid: (bill: Types.Bill, advance: boolean) => void
  unmarkPaid?: (bill: Types.Bill) => void
  paidInCurrentMonth?: boolean
  setEditing: (bill: Types.Bill) => void
  setConfirm: (confirm: Types.ConfirmState) => void
  t: TranslationDictionary
  locale: string
  currency: string
  hideValues?: boolean
  occurrenceMeta?: BillOccurrenceMeta
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
  occurrenceMeta,
}: BillRowProps) {
  const displayDueDate = occurrenceMeta?.occurrenceDate ?? bill.dueDate
  const sourceBill = occurrenceMeta?.source ?? bill
  const isPaid = !!bill.paid || !!paidInCurrentMonth
  const overdue = !isPaid && isBefore(displayDueDate, ymd(new Date()))
  const overdueDays = overdue ? daysDifference(displayDueDate, ymd(new Date())) : 0

  const formatValueWithTruncation = (amount: number | string) => {
    if (hideValues) {
      return "*****"
    }
    const numericAmount = typeof amount === "number" ? amount : Number(amount || 0)
    return fmtMoneyTruncated(numericAmount, currency, locale)
  }

  const recurrenceLabels: Record<Exclude<Types.Bill["recurrence"], "NONE">, string> = {
    DAILY: t.daily,
    WEEKLY: t.weekly,
    MONTHLY: t.monthly,
    YEARLY: t.yearly,
  }

  const getRecurrenceLabel = (recurrence: Types.Bill["recurrence"]) =>
    recurrence === "NONE" ? null : recurrenceLabels[recurrence] ?? recurrence.toLowerCase()

  const renderStatus = () => {
    if (!isPaid && overdue) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            markPaid(sourceBill, false)
          }}
          className="px-3 py-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-red-200 min-w-[110px] text-center zoom-500:text-[4px] zoom-500:px-1 zoom-500:py-1 zoom-500:min-w-[40px]"
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
            markPaid(sourceBill, false)
          }}
          className="px-3 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-700 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-amber-200 min-w-[110px] text-center zoom-500:text-[4px] zoom-500:px-1 zoom-500:py-1 zoom-500:min-w-[40px]"
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
          unmarkPaid(sourceBill)
        }}
        className="px-3 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-green-200 min-w-[110px] text-center zoom-500:text-[4px] zoom-500:px-1 zoom-500:py-1 zoom-500:min-w-[40px]"
        aria-label={`\: ${bill.title}`}
        title={t.mark_unpaid}
      >
        {t.paid}
      </button>
    )
  }

  const renderActionButtons = () => {
    return (
      <>
        <button
          onClick={(e) => {
            e.preventDefault()
            setEditing(sourceBill)
          }}
          className="px-2 py-2 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
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
            setConfirm({ open: true, id: sourceBill.id || null })
          }}
          className="px-2 py-2 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          aria-label={`${t.delete} ${bill.title}`}
          title={t.delete}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </>
    )
  }

  // JSX da linha da conta
  return (
    <div className="py-4 px-4 hover:bg-slate-50 rounded-lg border-b border-slate-100 last:border-b-0 transition-colors duration-200">
      {/* Desktop: ordem solicitada */}
      <div className="hidden md:flex items-center gap-4">
        {/* 1) Status - oculto em zoom 500% */}
        <div className="flex-shrink-0 zoom-500:hidden" role="status">{renderStatus()}</div>

        {/* 2) Categoria e Recorrência (vertical) - ocultos em zoom 500% */}
        <div className="flex flex-col gap-1 zoom-500:hidden">
          {/* Categoria */}
          {bill.category && (
            <Pill><span className="whitespace-nowrap">{bill.category.length > 12 ? `${bill.category.substring(0, 12)}...` : bill.category}</span></Pill>
          )}
          
          {/* Recorrência */}
          {(() => {
            const label = getRecurrenceLabel(bill.recurrence)
            return label ? (
              <Pill>
                <span className="whitespace-nowrap">{label}</span>
              </Pill>
            ) : null
          })()}
        </div>

        {/* 4) Título - oculto em zoom 250% */}
        <div className="min-w-0 flex-1 zoom-250:hidden zoom-500:text-right" style={{textAlign: window.innerWidth <= 500 ? 'right' : 'inherit'}}>
          <span className="font-semibold text-base zoom-500:text-sm text-slate-900 truncate block">{bill.title}</span>
        </div>

        {/* 5) Valor */}
        <div className="text-right whitespace-nowrap flex-shrink-0 max-w-[250px] zoom-500:max-w-[180px]">
          <div className="font-bold text-lg zoom-500:text-xs text-slate-900 max-w-[250px] zoom-500:max-w-[180px] truncate" title={hideValues ? "Valor oculto" : fmtMoneyTruncated(bill.amount, currency, locale)}>
            {formatValueWithTruncation(bill.amount)}
          </div>
        </div>

        {/* 6→8) Grupo à direita */}
        <div className="ml-auto flex items-center gap-2 justify-end text-right">
          {/* 6) Tempo / Data */}
          <div className="text-sm text-slate-600 whitespace-nowrap">
            {(isPaid && bill.paidOn)
              ? `${t.paid_on} ${formatDate(bill.paidOn, locale)}`
              : overdue
              ? (t.days_overdue as (days: number) => string)(overdueDays)
              : `${t.due_on} ${formatDate(displayDueDate, locale)}`}
          </div>
          {/* 7,8) Ações */}
          {renderActionButtons()}
        </div>
      </div>

      {/* Mobile: layout reorganizado - oculto em zoom 500% */}
      <div className="md:hidden p-4 zoom-500:p-2 zoom-500:hidden">
        {/* Layout mobile */}
        <div className="flex flex-col gap-3">
          {/* Primeira linha: categoria, recorrência, título e valor */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Categoria */}
              {bill.category && (
                <div className="text-sm text-slate-600 whitespace-nowrap">
                  {bill.category.length > 12 ? `${bill.category.substring(0, 12)}...` : bill.category}
                </div>
              )}
              
              {/* Recorrência */}
              {(() => {
                const label = getRecurrenceLabel(bill.recurrence)
                return label ? (
                  <div className="text-xs text-slate-600 whitespace-nowrap">
                    {label}
                  </div>
                ) : null
              })()}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Título */}
              <div 
                className="text-right max-w-[60%]"
                style={{ textAlign: window.innerWidth <= 500 ? 'right' : 'inherit' }}
              >
                <div className="font-semibold text-slate-900 truncate" title={bill.title}>
                  {bill.title.length > 50 ? `${bill.title.substring(0, 50)}...` : bill.title}
                </div>
              </div>
              
              {/* Valor */}
              <div 
                className="text-right"
                style={{ textAlign: window.innerWidth <= 500 ? 'right' : 'inherit' }}
              >
                <div className="font-bold text-xl text-slate-900 max-w-[300px] overflow-hidden text-ellipsis truncate" title={hideValues ? "Valor oculto" : fmtMoneyTruncated(bill.amount, currency, locale)}>
                  {formatValueWithTruncation(bill.amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Terceira linha: botão de estado à esquerda, data/editar/excluir à direita */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Botão de estado (pendente/atrasada/pago) */}
              <button
                onClick={() => {
                  if (isPaid && unmarkPaid) {
                    unmarkPaid(sourceBill);
                  } else {
                    // Marcar como pago sem avançar automaticamente
                    markPaid(sourceBill, false);
                  }
                }}
                className={cn(
                  "px-4 py-3 rounded-full text-base font-medium transition-colors duration-200 min-w-[100px] text-center",
                  isPaid
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : overdue
                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                )}
                title={isPaid ? t.mark_unpaid : t.mark_paid}
              >
                {isPaid ? t.paid : overdue ? t.overdue : t.pending}
              </button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Data */}
              <span className="text-sm text-slate-600 truncate">
                {(isPaid && bill.paidOn)
                  ? `${t.paid_on} ${formatDate(bill.paidOn, locale)}`
                  : formatDate(displayDueDate, locale)}
              </span>
              
              {/* Botão de editar */}
              <button
                onClick={() => setEditing(sourceBill)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1"
                title={t.edit}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              {/* Botão de excluir */}
              <button
                onClick={() => setConfirm({ open: true, id: sourceBill.id || null })}
                className="text-red-400 hover:text-red-600 transition-colors duration-200 p-1"
                title={t.delete}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Layout especial para zoom 500% - similar ao mobile mas com tamanhos reduzidos */}
      <div className="hidden md:hidden zoom-500:flex zoom-500:flex-col zoom-500:gap-1 zoom-500:p-1">
        {/* Primeira linha: categoria, recorrência, título e valor */}
        <div className="zoom-500:flex zoom-500:items-center zoom-500:justify-between zoom-500:gap-1">
          <div className="zoom-500:flex zoom-500:items-center zoom-500:gap-1 zoom-500:flex-1 zoom-500:min-w-0">
            {/* Categoria */}
            {bill.category && (
              <div className="zoom-500:bg-slate-100 zoom-500:px-1 zoom-500:py-0 zoom-500:rounded zoom-500:text-[8px] zoom-500:text-slate-600 zoom-500:whitespace-nowrap">
                {bill.category.length > 6 ? `${bill.category.substring(0, 6)}...` : bill.category}
              </div>
            )}
            
            {/* Recorrência */}
            {(() => {
              const label = getRecurrenceLabel(bill.recurrence)
              return label ? (
                <div className="zoom-500:bg-slate-100 zoom-500:px-1 zoom-500:py-0 zoom-500:rounded zoom-500:text-[8px] zoom-500:text-slate-600 zoom-500:whitespace-nowrap">
                  {label}
                </div>
              ) : null
            })()}
          </div>

          <div className="zoom-500:flex zoom-500:items-center zoom-500:gap-1 zoom-500:flex-shrink-0">
            {/* Título */}
            <div className="zoom-500:text-right zoom-500:max-w-[40%]">
              <div className="zoom-500:font-semibold zoom-500:text-[8px] zoom-500:text-slate-900 zoom-500:truncate" title={bill.title}>
                {bill.title.length > 15 ? `${bill.title.substring(0, 15)}...` : bill.title}
              </div>
            </div>
            
            {/* Valor */}
            <div className="zoom-500:text-right">
              <div className="zoom-500:font-bold zoom-500:text-[8px] zoom-500:text-slate-900 zoom-500:max-w-[80px] zoom-500:overflow-hidden zoom-500:text-ellipsis zoom-500:truncate" title={hideValues ? "Valor oculto" : fmtMoneyTruncated(bill.amount, currency, locale)}>
                {formatValueWithTruncation(bill.amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Segunda linha: botão de estado à esquerda, data/editar/excluir à direita */}
        <div className="zoom-500:flex zoom-500:items-center zoom-500:justify-between">
          <div className="zoom-500:flex zoom-500:items-center zoom-500:gap-1">
            {/* Botão de estado (pendente/atrasada/pago) */}
            <button
              onClick={() => {
                if (isPaid && unmarkPaid) {
                  unmarkPaid(sourceBill);
                } else {
                  markPaid(sourceBill, false);
                }
              }}
              className={cn(
                "zoom-500:px-1 zoom-500:py-1 zoom-500:rounded-full zoom-500:text-[8px] zoom-500:font-medium zoom-500:transition-colors zoom-500:duration-200 zoom-500:min-w-[40px] zoom-500:text-center",
                isPaid
                  ? "zoom-500:bg-green-100 zoom-500:text-green-800 hover:zoom-500:bg-green-200"
                  : overdue
                  ? "zoom-500:bg-red-100 zoom-500:text-red-800 hover:zoom-500:bg-red-200"
                  : "zoom-500:bg-amber-100 zoom-500:text-amber-800 hover:zoom-500:bg-amber-200"
              )}
              title={isPaid ? t.mark_unpaid : t.mark_paid}
            >
              {isPaid ? t.paid : overdue ? t.overdue : t.pending}
            </button>
          </div>

          <div className="zoom-500:flex zoom-500:items-center zoom-500:gap-1 zoom-500:flex-shrink-0">
            {/* Data */}
            <span className="zoom-500:text-[8px] zoom-500:text-slate-600 zoom-500:truncate">
              {(isPaid && bill.paidOn)
                ? formatDate(bill.paidOn, locale)
                : overdue
                ? `${overdueDays}d`
                : formatDate(displayDueDate, locale)}
            </span>
            
            {/* Botão de editar */}
            <button
              onClick={() => setEditing(sourceBill)}
              className="zoom-500:text-slate-400 hover:zoom-500:text-slate-600 zoom-500:transition-colors zoom-500:duration-200 zoom-500:p-0"
              title={t.edit}
            >
              <svg className="zoom-500:w-2 zoom-500:h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {/* Botão de excluir */}
            <button
              onClick={() => setConfirm({ open: true, id: sourceBill.id || null })}
              className="zoom-500:text-red-400 hover:zoom-500:text-red-600 zoom-500:transition-colors zoom-500:duration-200 zoom-500:p-0"
              title={t.delete}
            >
              <svg className="zoom-500:w-2 zoom-500:h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

        {/* Layout especial para zoom 500% - similar ao desktop mas com tamanhos reduzidos */}
        <div className="hidden md:hidden zoom-500:flex zoom-500:items-center zoom-500:gap-1 zoom-500:p-1">
          {/* 1) Status */}
          <div className="zoom-500:flex-shrink-0" role="status">
            <button
              onClick={() => {
                if (isPaid && unmarkPaid) {
                  unmarkPaid(sourceBill);
                } else {
                  markPaid(sourceBill, false);
                }
              }}
              className={cn(
                "zoom-500:px-1 zoom-500:py-1 zoom-500:rounded-full zoom-500:text-[8px] zoom-500:font-medium zoom-500:transition-colors zoom-500:duration-200 zoom-500:min-w-[40px] zoom-500:text-center",
                isPaid
                  ? "zoom-500:bg-green-100 zoom-500:text-green-800 hover:zoom-500:bg-green-200"
                  : overdue
                  ? "zoom-500:bg-red-100 zoom-500:text-red-800 hover:zoom-500:bg-red-200"
                  : "zoom-500:bg-amber-100 zoom-500:text-amber-800 hover:zoom-500:bg-amber-200"
              )}
              title={isPaid ? t.mark_unpaid : t.mark_paid}
            >
              {isPaid ? t.paid : overdue ? t.overdue : t.pending}
            </button>
          </div>

          {/* 2) Categoria e Recorrência (vertical) */}
          <div className="zoom-500:flex zoom-500:flex-col zoom-500:gap-0">
            {/* Categoria */}
            {bill.category && (
              <div className="zoom-500:bg-slate-100 zoom-500:px-1 zoom-500:py-0 zoom-500:rounded zoom-500:text-[8px] zoom-500:text-slate-600 zoom-500:whitespace-nowrap">
                {bill.category.length > 6 ? `${bill.category.substring(0, 6)}...` : bill.category}
              </div>
            )}
            
            {/* Recorrência */}
            {(() => {
              const label = getRecurrenceLabel(bill.recurrence)
              return label ? (
                <div className="zoom-500:bg-slate-100 zoom-500:px-1 zoom-500:py-0 zoom-500:rounded zoom-500:text-[8px] zoom-500:text-slate-600 zoom-500:whitespace-nowrap zoom-500:mt-0">
                  {label}
                </div>
              ) : null
            })()}
          </div>

          {/* 3) Título */}
          <div className="zoom-500:min-w-0 zoom-500:flex-1">
            <span className="zoom-500:font-semibold zoom-500:text-[8px] zoom-500:text-slate-900 zoom-500:truncate zoom-500:block">
              {bill.title.length > 15 ? `${bill.title.substring(0, 15)}...` : bill.title}
            </span>
          </div>

          {/* 4) Valor */}
          <div className="zoom-500:text-right zoom-500:whitespace-nowrap zoom-500:flex-shrink-0 zoom-500:max-w-[80px]">
            <div className="zoom-500:font-bold zoom-500:text-[8px] zoom-500:text-slate-900 zoom-500:max-w-[80px] zoom-500:truncate" title={hideValues ? "Valor oculto" : fmtMoneyTruncated(bill.amount, currency, locale)}>
              {formatValueWithTruncation(bill.amount)}
            </div>
          </div>

          {/* 5) Grupo à direita */}
          <div className="zoom-500:ml-auto zoom-500:flex zoom-500:items-center zoom-500:gap-1 zoom-500:justify-end zoom-500:text-right">
            {/* Data */}
            <div className="zoom-500:text-[8px] zoom-500:text-slate-600 zoom-500:whitespace-nowrap">
              {(isPaid && bill.paidOn)
                ? formatDate(bill.paidOn, locale)
                : overdue
                ? `${overdueDays}d`
                : formatDate(displayDueDate, locale)}
            </div>
            
            {/* Botão de editar */}
            <button
              onClick={() => setEditing(sourceBill)}
              className="zoom-500:text-slate-400 hover:zoom-500:text-slate-600 zoom-500:transition-colors zoom-500:duration-200 zoom-500:p-0"
              title={t.edit}
            >
              <svg className="zoom-500:w-2 zoom-500:h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {/* Botão de excluir */}
            <button
              onClick={() => setConfirm({ open: true, id: sourceBill.id || null })}
              className="zoom-500:text-red-400 hover:zoom-500:text-red-600 zoom-500:transition-colors zoom-500:duration-200 zoom-500:p-0"
              title={t.delete}
            >
              <svg className="zoom-500:w-2 zoom-500:h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
    </div>
  )
})

export default BillRow








