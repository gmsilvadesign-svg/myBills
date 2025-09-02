import { memo } from 'react';
import { fmtMoney, ymd, parseDate, daysInMonth } from '@/utils/utils';
import { useTranslation } from '@/hooks/useTranslation';
import * as Types from '@/types';
import { occurrencesForBillInMonth } from '@/utils/utils';

interface TotalsStripProps {
  bills: Types.Bill[];
  incomes: Types.Income[];
  purchases: Types.Purchase[];
  onFilterOverdue?: () => void;
  filter?: Types.FilterType;
}

const TotalsStrip = memo(function TotalsStrip({ bills, incomes, purchases, onFilterOverdue, filter = 'month' }: TotalsStripProps) {
  const { t, locale, currency } = useTranslation();
  const todayISO = ymd(new Date());
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const inMonth = (iso: string) => {
    const d = parseDate(iso);
    return d.getFullYear() === y && d.getMonth() === m;
  };

  // Renda do mês (planejada), independente de status
  const incomeMonth = incomes.reduce((sum, i) => {
    const base = parseDate(i.dueDate);
    switch (i.recurrence) {
      case 'MONTHLY':
        return sum + Number(i.amount || 0);
      case 'WEEKLY': {
        // Número de ocorrências daquele weekday no mês
        const weekday = base.getDay();
        let count = 0;
        for (let d = 1; d <= daysInMonth(y, m); d++) {
          if (new Date(y, m, d).getDay() === weekday) count++;
        }
        return sum + count * Number(i.amount || 0);
      }
      case 'DAILY':
        return sum + daysInMonth(y, m) * Number(i.amount || 0);
      case 'YEARLY':
        return base.getMonth() === m ? sum + Number(i.amount || 0) : sum;
      case 'NONE':
      default:
        return inMonth(i.dueDate) ? sum + Number(i.amount || 0) : sum;
    }
  }, 0);

  // Abertas do mês: não pagas com dueDate no mês vigente
  const monthOpen = bills.filter(b => !b.paid && inMonth(b.dueDate))
    .reduce((s, b) => s + Number(b.amount || 0), 0);

  // Atrasadas do mês: não pagas com dueDate no mês vigente e anterior a hoje
  const monthOverdue = bills.filter(b => !b.paid && inMonth(b.dueDate) && parseDate(b.dueDate) < parseDate(todayISO))
    .reduce((s, b) => s + Number(b.amount || 0), 0);

  // Total de contas do mês (planejado), independente de status e avanço de recorrência
  const monthBillsTotal = bills.reduce((sum, b) => {
    const base = parseDate(b.dueDate);
    switch (b.recurrence) {
      case 'MONTHLY':
        return sum + Number(b.amount || 0);
      case 'WEEKLY': {
        const weekday = base.getDay();
        let count = 0;
        for (let d = 1; d <= daysInMonth(y, m); d++) {
          if (new Date(y, m, d).getDay() === weekday) count++;
        }
        return sum + count * Number(b.amount || 0);
      }
      case 'DAILY':
        return sum + daysInMonth(y, m) * Number(b.amount || 0);
      case 'YEARLY':
        return base.getMonth() === m ? sum + Number(b.amount || 0) : sum;
      case 'NONE':
      default:
        return inMonth(b.dueDate) ? sum + Number(b.amount || 0) : sum;
    }
  }, 0);

  // Compras conforme o filtro ativo (para manter consistência com a aba Compras)
  const isToday = (iso: string) => { const d = parseDate(iso); const t = new Date(); return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate(); };
  const purchasesTotal = purchases.filter(p => {
    if (filter === 'today') return isToday(p.date);
    if (filter === 'month') return inMonth(p.date);
    if (filter === 'all') return true;
    // Demais filtros não se aplicam a compras: manter mês como padrão
    return inMonth(p.date);
  }).reduce((s, p) => s + Number(p.amount || 0), 0);

  // Economia = renda do mês - (total de contas do mês + compras do mês)
  const savings = incomeMonth - (monthBillsTotal + purchasesTotal);
  const pct = incomeMonth > 0 ? (savings / incomeMonth) * 100 : 0;
  const pctFmt = incomeMonth > 0
    ? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(pct / 100)
    : '—';
  let pctColor = 'text-red-600';
  if (pct > 25) pctColor = 'text-lime-400 font-semibold';
  else if (pct > 10) pctColor = 'text-emerald-700 dark:text-emerald-200 font-medium';
  else if (pct > 5) pctColor = 'text-yellow-500 font-medium';
  else if (pct > 0) pctColor = 'text-orange-500 font-medium';

  return (
    <div className="w-full flex items-center justify-center mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full max-w-6xl">
        <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 text-center shadow-sm">
          <div className="text-xs sm:text-sm font-medium">Renda</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(incomeMonth, currency, locale)}</div>
        </div>
        <div className="rounded-xl p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-200 text-center shadow-sm">
          <div className="text-xs sm:text-sm font-medium">Economia</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(savings, currency, locale)}</div>
          <div className={`text-[11px] sm:text-xs ${pctColor}`}>{pctFmt}</div>
        </div>
        <div className="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 text-center shadow-sm">
          <div className="text-xs sm:text-sm font-medium">{t.purchases || 'Compras'}</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(purchasesTotal, currency, locale)}</div>
        </div>
        <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 text-center shadow-sm">
          <div className="text-xs sm:text-sm font-medium">{t.totals_open}</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(monthOpen, currency, locale)}</div>
        </div>
        <button
          onClick={onFilterOverdue}
          className="rounded-xl p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          <div className="text-xs sm:text-sm font-medium">{t.filter_overdue}</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(monthOverdue, currency, locale)}</div>
        </button>
      </div>
    </div>
  );
});

export default TotalsStrip;
