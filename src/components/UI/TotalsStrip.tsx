import { memo } from 'react';
import { fmtMoney, parseDate, daysInMonth } from '@/utils/utils';
import { useTranslation } from '@/hooks/useTranslation';
import * as Types from '@/types';
import { occurrencesForBillInMonth } from '@/utils/utils';
import PieChart from '@/components/UI/charts/PieChart';

interface TotalsStripProps {
  bills: Types.Bill[];
  incomes: Types.Income[];
  purchases: Types.Purchase[];
  onFilterOverdue?: () => void;
  filter?: Types.FilterType;
}

const TotalsStrip = memo(function TotalsStrip({ bills, incomes, purchases, filter = 'month' }: TotalsStripProps) {
  const { locale, currency } = useTranslation();
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const inMonth = (iso: string) => {
    const d = parseDate(iso);
    return d.getFullYear() === y && d.getMonth() === m;
  };
  const inMonthOpt = (iso?: string | null) => !!iso && inMonth(iso);

  // Renda do mês (planejada)
  const incomeMonth = incomes.reduce((sum, i) => {
    const base = parseDate(i.dueDate);
    switch (i.recurrence) {
      case 'MONTHLY':
        return sum + Number(i.amount || 0);
      case 'WEEKLY': {
        const weekday = base.getDay();
        let count = 0;
        for (let d = 1; d <= daysInMonth(y, m); d++) if (new Date(y, m, d).getDay() === weekday) count++;
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

  // Total de contas do mês (planejado)
  const monthBillsTotal = bills.reduce((sum, b) => {
    const base = parseDate(b.dueDate);
    switch (b.recurrence) {
      case 'MONTHLY':
        return sum + Number(b.amount || 0);
      case 'WEEKLY': {
        const weekday = base.getDay();
        let count = 0;
        for (let d = 1; d <= daysInMonth(y, m); d++) if (new Date(y, m, d).getDay() === weekday) count++;
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

  // Compras (mantendo consistência com o filtro atual)
  const isToday = (iso: string) => { const d = parseDate(iso); const t = new Date(); return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate(); };
  const purchasesTotal = purchases.filter(p => {
    if (filter === 'today') return isToday(p.date);
    if (filter === 'month') return inMonth(p.date);
    if (filter === 'all') return true;
    return inMonth(p.date);
  }).reduce((s, p) => s + Number(p.amount || 0), 0);

  // Economia mensal
  const savings = incomeMonth - (monthBillsTotal + purchasesTotal);

  // Abertas/atrasadas (até o fim do mês) x Pagas
  const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
  const openOrOverdue = bills.filter(b => !b.paid && parseDate(b.dueDate) <= endOfMonth)
    .reduce((s, b) => s + Number(b.amount || 0), 0);
  // Somente contas marcadas como pagas neste mês (alinha com a lista "Contas pagas")
  const paidInMonth = bills.filter(b => inMonthOpt(b.paidOn))
    .reduce((s, b) => s + Number(b.amount || 0), 0);

  return (
    <div className="w-full flex items-center justify-center mb-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1 - Renda total (por categoria) */}
          <div className="flex flex-col items-center">
            {(() => {
              const incomeByCat = new Map<string, number>();
              incomes.forEach(i => {
                let has = false;
                try { has = occurrencesForBillInMonth({ dueDate: i.dueDate, recurrence: i.recurrence } as any, y, m).length>0; } catch { has = inMonth(i.dueDate); }
                if (has) {
                  const label = i.category || 'Outros';
                  incomeByCat.set(label, (incomeByCat.get(label)||0) + Number(i.amount||0));
                }
              });
              const incData = Array.from(incomeByCat, ([label, value]) => ({ label, value, color: '#10b981' }));
              return (
                <PieChart
                  size={180}
                  data={incData.length ? incData : [{ label: 'Sem renda', value: 1, color: '#64748b' }]}
                  paletteType="cool"
                  formatValue={(v) => fmtMoney(v, currency, locale)}
                  centerText={fmtMoney(incomeMonth, currency, locale)}
                  centerBold
                  showLegend={false}
                />
              );
            })()}
            <div className="mt-2 font-bold text-slate-700 dark:text-slate-200">Renda</div>
          </div>

          {/* 2 - Economia: anel cinza com fatia branca */}
          <div className="flex flex-col items-center">
            {(() => {
              const econ = Math.max(0, savings);
              const rest = Math.max(0, incomeMonth - econ);
              const data = [
                { label: 'Restante', value: rest, color: '#1f2937' },
                { label: 'Economia', value: econ, color: '#ffffff' },
              ];
              return (
                <PieChart
                  size={180}
                  data={data}
                  showLegend={false}
                  centerText={fmtMoney(econ, currency, locale)}
                  centerBold
                />
              );
            })()}
            <div className="mt-2 font-bold text-slate-700 dark:text-slate-200">Economia</div>
          </div>

          {/* 3 - Contas em aberto/atrasadas x pagas */}
          <div className="flex flex-col items-center">
            <PieChart
              size={180}
              data={[
                { label: 'Abertas/Atrasadas', value: openOrOverdue, color: '#ef4444' },
                { label: 'Pagas', value: paidInMonth, color: '#10b981' },
              ]}
              formatValue={(v) => fmtMoney(v, currency, locale)}
              centerText={fmtMoney(openOrOverdue, currency, locale)}
              centerBold
              centerCheck={openOrOverdue <= 0}
              showLegend={false}
            />
            <div className="mt-2 font-bold text-slate-700 dark:text-slate-200">Contas</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TotalsStrip;
