// Importa componente Section para agrupar conteúdo com título
import Section from '../../layout/Section.tsx'

// Importa componente MonthGrid, que exibe o calendário mensal com as contas
import MonthGrid from '../bills/MonthGrid'

// Importa função utilitária monthLabel para formatar o nome do mês baseado em locale
import { monthLabel } from '../../../utils/utils.ts'

// Componente BillsCalendar: exibe as contas em formato de calendário mensal
export default function BillsCalendar({ bills, monthDate, setMonthDate, locale, currency, t }) {

  // JSX do calendário
  return (
    // Seção com título, utilizando tradução e nome do mês
    <Section title={t.calendar_title(monthLabel(monthDate, locale))}>

      {/* Controles para navegar entre meses */}
      <div className="flex items-center gap-3 mb-3">

        {/* Botão para ir para o mês anterior */}
        <button 
          onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))} 
          className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800"
        >
          ◀
        </button>

        {/* Exibe o nome do mês atual */}
        <div className="font-semibold">{monthLabel(monthDate, locale)}</div>

        {/* Botão para ir para o próximo mês */}
        <button 
          onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))} 
          className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800"
        >
          ▶
        </button>

      </div>

      {/* Componente que renderiza a grade do mês com todas as contas */}
      <MonthGrid 
        date={monthDate} 
        bills={bills} 
        locale={locale} 
        currency={currency} 
        t={t} 
      />

    </Section>
  )
}
