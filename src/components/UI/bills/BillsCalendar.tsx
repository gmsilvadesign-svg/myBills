import Section from '../../layout/Section.tsx';
import MonthGrid from '../bills/MonthGrid';
import { monthLabel } from '../../../utils/utils.ts';

export default function BillsCalendar({ bills, monthDate, setMonthDate, locale, currency, t }) {
  return (
    <Section title={t.calendar_title(monthLabel(monthDate, locale))}>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={()=>setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()-1,1))} className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800">◀</button>
        <div className="font-semibold">{monthLabel(monthDate, locale)}</div>
        <button onClick={()=>setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()+1,1))} className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800">▶</button>
      </div>
      <MonthGrid date={monthDate} bills={bills} locale={locale} currency={currency} t={t}/>
    </Section>
  )
}