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
  let pctColor = 'text-red-600';
  if (pct > 25) pctColor = 'text-lime-400 font-semibold';
  else if (pct > 10) pctColor = 'text-emerald-700 dark:text-emerald-200 font-medium';
  else if (pct > 5) pctColor = 'text-yellow-500 font-medium';
  else if (pct > 0) pctColor = 'text-orange-500 font-medium';
  // Total de gastos (contas + compras) do mês
  const expensesTotal = monthBillsTotal + purchasesTotal;

  // Configuração dos pilares (valores e estilos)
  const items = [
    { key: 'income', label: 'Renda', value: incomeMonth, color: 'bg-emerald-500 dark:bg-emerald-400', textColor: 'text-emerald-700 dark:text-emerald-200' },
    { key: 'savings', label: 'Economia', value: savings, color: (savings >= 0 ? 'bg-teal-500 dark:bg-teal-400' : 'bg-red-500 dark:bg-red-500'), textColor: (savings >= 0 ? 'text-teal-700 dark:text-teal-200' : 'text-red-600 dark:text-red-400'), pctColor },
    { key: 'expenses', label: 'Gastos', value: expensesTotal, color: 'bg-indigo-500 dark:bg-indigo-400', textColor: 'text-indigo-700 dark:text-indigo-200' },
    { key: 'open', label: t.totals_open, value: monthOpen, color: 'bg-amber-500 dark:bg-amber-400', textColor: 'text-amber-700 dark:text-amber-200' },
  ] as const;

  const maxAbs = Math.max(1, ...items.map(i => Math.abs(Number(i.value || 0))));

  const fmtPrime = (n: number) => `${Math.round(n)}%`;

  const percentFor = (v: number) => {
    if (incomeMonth > 0) return fmtPrime((v / incomeMonth) * 100);
    // fallback: relativo ao maior absoluto
    return fmtPrime((Math.abs(v) / maxAbs) * 100 * Math.sign(v || 0));
  };

  return (
    <div className="w-full flex items-center justify-center mb-4">
      <div className="w-full max-w-6xl">
        {/* Área das barras com a linha-base ao centro da própria área */}
        <div className="relative h-40 px-2 flex items-end justify-center gap-6">
          <div className="absolute left-0 right-0 top-1/2 border-t border-slate-200 dark:border-slate-700 pointer-events-none" />
          {items.map((it) => {
            const val = Number(it.value || 0);
            const abs = Math.abs(val);
            const ratio = Math.min(1, abs / maxAbs);
            const showNegativeOnTop = val < 0 && it.key !== 'expenses';
            const barColor = showNegativeOnTop ? 'bg-red-500 dark:bg-red-400' : it.color;
            const pos = (val >= 0 || showNegativeOnTop) ? ratio : 0;
            const neg = (val < 0 && !showNegativeOnTop) ? ratio : 0;
            const barEl = (
              <div className="w-14 sm:w-16 h-40 relative">
                {/* metade superior (positivo) */}
                <div className="absolute left-0 right-0 top-0 h-1/2">
                  <div
                    className={`absolute left-0 right-0 bottom-0 ${barColor} rounded-t-xl shadow-md`}
                    style={{ height: `${pos * 100}%` }}
                  />
                  {/* Marcação interna de Compras dentro da barra de Gastos */}
                  {it.key === 'expenses' && expensesTotal > 0 && purchasesTotal > 0 && pos > 0 && (
                    <>
                      <div
                        className="absolute left-1/2 -translate-x-1/2 w-[60%] rounded-t-lg bg-blue-500/90 dark:bg-blue-400/90"
                        style={{ bottom: 0, height: `${pos * 100 * (purchasesTotal / Math.max(1, expensesTotal))}%` }}
                      />
                      <div
                        className="absolute left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-white"
                        style={{ bottom: `${pos * 100 * (purchasesTotal / Math.max(1, expensesTotal))}%` }}
                      >
                        {Math.round((purchasesTotal / Math.max(1, expensesTotal)) * 100)}%
                      </div>
                    </>
                  )}
                  {pos > 0 && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 text-[10px] sm:text-xs ${val < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}
                      style={{ bottom: `${pos * 100}%` }}
                    >
                      {percentFor(val)}
                    </div>
                  )}
                </div>
                {/* metade inferior (negativo) */}
                <div className="absolute left-0 right-0 bottom-0 h-1/2">
                  <div
                    className={`absolute left-0 right-0 top-0 ${barColor} rounded-b-xl shadow-md`}
                    style={{ height: `${neg * 100}%` }}
                  />
                  {neg > 0 && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300"
                      style={{ top: `${neg * 100}%` }}
                    >
                      {percentFor(val)}
                    </div>
                  )}
                </div>
              </div>
            );
            if (it.onClick) {
              return (
                <button key={it.key} onClick={it.onClick} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 rounded-xl">
                  {barEl}
                </button>
              );
            }
            return <div key={it.key}>{barEl}</div>;
          })}
        </div>
        {/* Rótulos imediatamente abaixo das barras */}
        <div className="flex items-start justify-center gap-6 px-2 mt-1">
          {items.map((it) => {
            const valueColor = it.key === 'savings' ? it.textColor : 'text-slate-900 dark:text-slate-100';
            const block = (
              <div className="w-20 sm:w-24 text-center">
                <div className={`text-xs sm:text-sm font-medium ${it.textColor || ''}`}>{it.label}</div>
                <div className={`text-sm sm:text-base font-semibold ${valueColor}`}>{fmtMoney(Number(it.value || 0), currency, locale)}</div>
                {it.key === 'expenses' && (
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-block w-2.5 h-2.5 rounded bg-blue-700 dark:bg-blue-600" />
                    <span>{t.purchases || 'Compras'}</span>
                  </div>
                )}
              </div>
            );
            if (it.onClick) return <button key={it.key} onClick={it.onClick} className="focus:outline-none rounded-xl">{block}</button>;
            return <div key={it.key}>{block}</div>;
          })}
        </div>
      </div>
    </div>
  );
});

export default TotalsStrip;
