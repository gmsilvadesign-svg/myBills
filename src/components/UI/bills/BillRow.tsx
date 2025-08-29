// React
import { memo } from 'react';

// Components
import Pill from '@/components/UI/Pill';

// Utils
import { 
  fmtMoney, 
  formatDate, 
  isBefore, 
  ymd, 
  daysDifference 
} from '@/utils/utils';

// Types
import * as Types from '@/types';

interface BillRowProps {
  bill: Types.Bill;
  markPaid: (bill: Types.Bill, advance: boolean) => void;
  setEditing: (bill: Types.Bill) => void;
  setConfirm: (confirm: Types.ConfirmState) => void;
  t: Record<string, string>; // Traduções
  locale: string;
  currency: string;
}

const BillRow = memo(function BillRow({ bill, markPaid, setEditing, setConfirm, t, locale, currency }: BillRowProps) {
  const overdue = !bill.paid && isBefore(bill.dueDate, ymd(new Date()))
  const overdueDays = overdue ? daysDifference(bill.dueDate, ymd(new Date())) : 0

  // Renderiza o status da conta
  const renderStatus = () => {
    if (!bill.paid && overdue) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            markPaid(bill, bill.recurrence && bill.recurrence !== 'NONE');
          }}
          className="px-3 py-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300 dark:hover:from-red-800/40 dark:hover:to-red-700/40 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-red-200 dark:border-red-700 min-w-[110px] text-center"
          aria-label={`${t.mark_paid}: ${bill.title}`}
          title={t.mark_paid}
        >
          🚨 {t.overdue}
        </button>
      )
    }
    if (!bill.paid && !overdue) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            markPaid(bill, bill.recurrence && bill.recurrence !== 'NONE');
          }}
          className="px-3 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-700 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-300 dark:hover:from-amber-800/40 dark:hover:to-amber-700/40 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-amber-200 dark:border-amber-700 min-w-[110px] text-center"
          aria-label={`${t.mark_paid}: ${bill.title}`}
          title={t.mark_paid}
        >
          ⏳ {t.pending}
        </button>
      )
    }
    return (
      <button
        className="px-3 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300 dark:hover:from-green-800/40 dark:hover:to-green-700/40 text-xs font-medium cursor-default transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 shadow-sm hover:shadow-md border border-green-200 dark:border-green-700 min-w-[110px] text-center"
        disabled
      >
        ✅ {t.paid}
      </button>
    )
  }

  // Função auxiliar para renderizar os botões de ação
  const renderActionButtons = () => (
    <>
      {/* Botão para editar a conta */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          setEditing(bill);
        }} 
        className="px-2 py-2 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        aria-label={`${t.edit} ${bill.title}`}
        title={t.edit}
      >
        <span aria-hidden="true">✏️</span>
      </button>

      {/* Botão para deletar a conta (abre modal de confirmação) */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          setConfirm({ open: true, id: bill.id || null });
        }} 
        className="px-2 py-2 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 border border-red-200 dark:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        aria-label={`${t.delete} ${bill.title}`}
        title={t.delete}
      >
        <span aria-hidden="true">🗑️</span>
      </button>
    </>
  )

  // JSX da linha da conta
  return (
    // Container principal da linha, responsivo - layout vertical em mobile, horizontal em desktop
    <div className="py-4 px-4 hover:bg-slate-50 dark:hover:bg-[#AABBCC]/15 rounded-lg border-b border-slate-100 dark:border-[#AABBCC]/30 last:border-b-0 transition-colors duration-200">
      
      {/* Layout desktop - flex com espaçamento */}
      <div className="hidden md:flex items-center gap-4">
        {/* Coluna 1: Título, categoria e recorrência */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {bill.title}
            </span>
            {/* Tags: categoria e recorrência */}
            <div className="flex gap-1">
              {bill.category && <Pill><span className="whitespace-nowrap">{bill.category}</span></Pill>}
              {bill.recurrence && bill.recurrence !== "NONE" && <Pill tone="green"><span className="whitespace-nowrap">{t[bill.recurrence.toLowerCase()]}</span></Pill>}
            </div>
          </div>
        </div>
            
        {/* Coluna 2: Valor da conta */}
        <div className="text-right whitespace-nowrap flex-shrink-0">
          <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
            {fmtMoney(bill.amount, currency, locale)}
          </div>
        </div>

        {/* Coluna 3: Status da conta */}
        <div className="flex justify-center flex-shrink-0" role="status">
          {renderStatus()}
        </div>
        
        {/* Coluna 4: Informações de data */}
        <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap w-36 flex-shrink-0 ">
          <div className="text-center">
            {bill.paid && bill.paidOn
              ? `${t.paid_on} ${formatDate(bill.paidOn, locale)}`
              : overdue
              ? (t.days_overdue as (days: number) => string)(overdueDays)
              : `${t.due_on} ${formatDate(bill.dueDate, locale)}`}
          </div>
        </div>

        {/* Coluna 5: Botões de ação */}
        <div className="flex gap-2 justify-end flex-shrink-0">
          {renderActionButtons()}
        </div>
      </div>

      {/* Layout mobile - empilhado verticalmente */}
      <div className="md:hidden space-y-4">
        {/* Cabeçalho: título, tags e valor */}
        <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
          <div className="min-w-0">
            {/* Título da conta */}
            <div className="font-semibold text-base leading-tight text-slate-900 dark:text-slate-100 mb-2 whitespace-nowrap">
              {bill.title}
            </div>
            {/* Tags: categoria e recorrência */}
            <div className="flex gap-2 overflow-x-auto">
              {bill.category && <Pill><span className="whitespace-nowrap">{bill.category}</span></Pill>}
              {bill.recurrence && bill.recurrence !== "NONE" && <Pill tone="green"><span className="whitespace-nowrap">{t[bill.recurrence.toLowerCase()]}</span></Pill>}
            </div>
          </div>
          <div className="text-right">
            {/* Valor */}
            <div className="font-bold text-lg text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {fmtMoney(bill.amount, currency, locale)}
            </div>
          </div>
        </div>

        {/* Status e informações de data */}
        <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
          <div role="status">
            {renderStatus()}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap text-right">
            {bill.paid && bill.paidOn
              ? `${t.paid_on} ${formatDate(bill.paidOn, locale)}`
              : overdue
              ? (t.days_overdue as (days: number) => string)(overdueDays)
              : `${t.due_on} ${formatDate(bill.dueDate, locale)}`}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-1">
          {renderActionButtons()}
        </div>
      </div>

    </div>
  )
})

export default BillRow
