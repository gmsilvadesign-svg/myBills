// Importa React e componentes necessários
import { useCallback, useState } from 'react'
import Section from '@/components/layout/Section'

// Importa componente MonthGrid, que exibe o calendário mensal com as contas
import MonthGrid from '@/components/UI/bills/MonthGrid'
import DayDetailsModal from '@/components/UI/modals/DayDetailsModal'

// Importa função utilitária monthLabel para formatar o nome do mês baseado em locale
import { monthLabel, ymd } from '@/utils/utils'

// Importa tipos
import * as Types from '@/types'

// Interface para as props do componente
interface BillsCalendarProps {
  bills: Types.Bill[];
  purchases?: Types.Purchase[];
  monthDate: Date;
  setMonthDate: (date: Date) => void;
  locale: string;
  currency: string;
  t: Record<string, string>; // Traduções
}

// Componente BillsCalendar: exibe as contas em formato de calendário mensal
export default function BillsCalendar({ bills, purchases = [], monthDate, setMonthDate, locale, currency, t }: BillsCalendarProps) {

  // Funções de navegação otimizadas com useCallback
  const goToPreviousMonth = useCallback(() => {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1));
  }, [monthDate, setMonthDate]);

  const goToNextMonth = useCallback(() => {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1));
  }, [monthDate, setMonthDate]);

  // Modal de detalhes do dia
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // JSX do calendário
  return (
    // Seção com título, utilizando tradução e nome do mês
    <Section title={t.calendar_title(monthLabel(monthDate, locale))}>

      {/* Controles para navegar entre meses */}
      <nav className="flex items-center justify-between mb-4" aria-label={t.calendar_navigation || "Navegação do calendário"}>

        {/* Botão para ir para o mês anterior */}
        <button 
          onClick={goToPreviousMonth} 
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
          aria-label={t.previous_month || "Mês anterior"}
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Exibe o nome do mês atual */}
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200" aria-live="polite">{monthLabel(monthDate, locale)}</h3>

        {/* Botão para ir para o próximo mês */}
        <button 
          onClick={goToNextMonth} 
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
          aria-label={t.next_month || "Próximo mês"}
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </nav>

      {/* Componente que renderiza a grade do mês com todas as contas e compras por dia */}
      <MonthGrid
        date={monthDate}
        bills={bills}
        purchases={purchases}
        locale={locale}
        currency={currency}
        onDayClick={(iso) => setSelectedDay(iso)}
      />

      {/* Modal com itens do dia */}
      <DayDetailsModal
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        dateISO={selectedDay || ymd(monthDate)}
        bills={bills}
        purchases={purchases}
        locale={locale}
        currency={currency}
        t={t}
      />

    </Section>
  )
}
