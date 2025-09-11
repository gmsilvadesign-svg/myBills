import { memo } from 'react';
import { fmtMoney, ymd, parseDate, daysInMonth } from '@/utils/utils';
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

  // Abertas do mes: nao pagas com dueDate no mes vigente
  const monthOpen = bills.filter(b => !b.paid && inMonth(b.dueDate))
    .reduce((s, b) => s + Number(b.amount || 0), 0);
  // Pagas do mes: pagas com dueDate no mes vigente
  const monthPaid = bills.filter(b => b.paid && (inMonth(b.dueDate) || inMonthOpt(b.paidOn)))
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
  // Economia = renda do mes - (total de contas do mes + compras do mes)
  const savings = incomeMonth - (monthBillsTotal + purchasesTotal);

  return (
    <div className="w-full flex items-center justify-center mb-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <PieChart
              size={180}
              data={[
                { label: 'Abertas', value: monthOpen, color: '#f59e0b' },
                { label: 'Pagas', value: monthPaid, color: '#10b981' },
              ]}
              paletteType="warm"
              formatValue={(v) => fmtMoney(v, currency, locale)}
              centerText={fmtMoney(monthOpen, currency, locale)}
              centerBold
              centerCheck={monthOpen <= 0}
            />
          </div>
          <div className="flex items-center">
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
                />
              );
            })()}
          </div>
          <div className="flex items-center">
            {(() => {
              const econ = Math.max(0, savings);
              const pctSaved = incomeMonth > 0 ? Math.max(0, (econ / incomeMonth) * 100) : 0;
              const pctStr = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(pctSaved) + '%';
              const data = [
                { label: 'Contas', value: monthBillsTotal, color: '#ef4444' },
                { label: 'Compras', value: purchasesTotal, color: '#3b82f6' },
                { label: 'Economia', value: econ, color: '#10b981' },
              ];
              return (
                <PieChart
                  size={180}
                  data={data}
                  paletteType="warm"
                  formatValue={(v) => fmtMoney(v, currency, locale)}
                  centerText={fmtMoney(econ, currency, locale)}
                  centerSubText={pctStr}
                  centerBold
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TotalsStrip;




