import { memo, useMemo } from 'react';
import { fmtMoney, parseDate, daysInMonth, occurrencesForBillInMonth } from '@/utils/utils';
import { useTranslation } from '@/hooks/useTranslation';
import * as Types from '@/types';
import PieChart from '@/components/UI/charts/PieChart';
import RadialProgress from '@/components/UI/charts/RadialProgress';
import { cn } from '@/styles/constants';

interface TotalsStripProps {
  bills: Types.Bill[];
  incomes: Types.Income[];
  purchases: Types.Purchase[];
  goals?: Types.UserGoals;
  onFilterOverdue?: () => void;
  filter?: Types.FilterType;
  valuesHidden?: boolean;
  hideCircles?: boolean;
}

const ratioColorTarget = (ratio: number) => {
  if (ratio >= 1.1) return '#0ea5e9';
  if (ratio >= 1) return '#22c55e';
  if (ratio >= 0.75) return '#65a30d';
  if (ratio >= 0.5) return '#f59e0b';
  return '#ef4444';
};

const ratioColorCeiling = (ratio: number) => {
  if (ratio >= 1.1) return '#dc2626';
  if (ratio >= 1) return '#f97316';
  if (ratio >= 0.75) return '#facc15';
  if (ratio >= 0.5) return '#65a30d';
  return '#22c55e';
};

const ratioFrom = (value: number, limit?: number | null) => {
  if (!limit || !Number.isFinite(limit) || limit <= 0) return null;
  return value / limit;
};

const fallbackSlice = (label: string) => [{ label, value: 1, color: '#94a3b8' }];

const formatPercent = (ratio: number | null, formatter: Intl.NumberFormat) => {
  if (ratio === null || Number.isNaN(ratio)) return '--';
  return formatter.format(Math.max(0, ratio));
};

const TotalsStrip = memo(function TotalsStrip({
  bills,
  incomes,
  purchases,
  goals,
  filter = 'month',
  valuesHidden = false,
  hideCircles = false,
}: TotalsStripProps) {
  const { locale, currency } = useTranslation();
  const percentFormatter = useMemo(() => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }), [locale]);
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const inMonth = (iso: string) => {
    const d = parseDate(iso);
    return d.getFullYear() === y && d.getMonth() === m;
  };
  const inMonthOpt = (iso?: string | null) => !!iso && inMonth(iso);

  // Renda do m�s (planejada)
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

  // Total de contas do m�s (planejado)
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

  // Compras (mantendo consist�ncia com o filtro atual)
  const isToday = (iso: string) => {
    const d = parseDate(iso);
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };
  const purchasesTotal = purchases
    .filter((p) => {
      if (filter === 'today') return isToday(p.date);
      if (filter === 'month') return inMonth(p.date);
      if (filter === 'all') return true;
      return inMonth(p.date);
    })
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  // Economia mensal
  const savings = incomeMonth - (monthBillsTotal + purchasesTotal);
  const monthlySpend = monthBillsTotal + purchasesTotal;

  // Abertas/atrasadas x Pagas (at� o fim do m�s)
  const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
  const openOrOverdue = bills
    .filter((b) => !b.paid && parseDate(b.dueDate) <= endOfMonth)
    .reduce((s, b) => s + Number(b.amount || 0), 0);
  const paidInMonth = bills.filter((b) => inMonthOpt(b.paidOn)).reduce((s, b) => s + Number(b.amount || 0), 0);

  const formattedCurrency = (value: number) => fmtMoney(value, currency, locale);
  const maskValue = (value: string) => (valuesHidden ? '****' : value);
  const maskCurrency = (value: number) => maskValue(formattedCurrency(value));

  const incomeTarget = goals?.incomeTarget ?? null;
  const savingsTarget = goals?.savingsTarget ?? null;
  const expensesLimit = goals?.expensesLimit ?? null;

  const incomeRatio = ratioFrom(incomeMonth, incomeTarget);
  const savingsRatio = ratioFrom(Math.max(0, savings), savingsTarget);
  const expensesRatio = ratioFrom(monthlySpend, expensesLimit);

  const hoverIncomeText = !valuesHidden ? formatPercent(incomeRatio, percentFormatter) : undefined;
  const hoverSavingsText = !valuesHidden ? formatPercent(savingsRatio, percentFormatter) : undefined;
  const hoverExpensesText = !valuesHidden ? formatPercent(expensesRatio, percentFormatter) : undefined;

  const incomeHoverColor = incomeRatio !== null ? ratioColorTarget(incomeRatio) : '#22c55e';
  const savingsHoverColor = savingsRatio !== null ? ratioColorTarget(savingsRatio) : savings >= 0 ? '#16a34a' : '#dc2626';
  const expensesHoverColor = expensesRatio !== null ? ratioColorCeiling(expensesRatio) : '#f97316';

  const incomeByCategory = new Map<string, number>();
  incomes.forEach((i) => {
    let occCount = 0;
    try {
      occCount = occurrencesForBillInMonth({ dueDate: i.dueDate, recurrence: i.recurrence } as any, y, m).length;
    } catch {
      occCount = inMonth(i.dueDate) ? 1 : 0;
    }
    if (occCount > 0) {
      const label = i.category || 'Outros';
      incomeByCategory.set(label, (incomeByCategory.get(label) || 0) + occCount * Number(i.amount || 0));
    }
  });
  const incomeSlices = incomeByCategory.size ? Array.from(incomeByCategory, ([label, value]) => ({ label, value, color: '' })) : fallbackSlice('Sem renda');


  return (
    <div className="w-full flex justify-center mb-6">
      <div className={cn('w-full max-w-6xl space-y-8 transition-all', valuesHidden && 'blur-sm pointer-events-none select-none')}>
        {!hideCircles && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-5">
              <PieChart
                size={204}
                data={incomeSlices}
                paletteType="cool"
                formatValue={(v) => maskCurrency(v)}
                centerText={maskCurrency(incomeMonth)}
                centerBold
                showLegend={false}
                hoverCenterText={!valuesHidden && hoverIncomeText !== '--' ? hoverIncomeText : undefined}
                hoverCenterTextColor={incomeHoverColor}
                hoverFontScale={1.18}
              />
              <RadialProgress
                value={incomeMonth}
                target={incomeTarget}
                label="Meta de renda"
                valueFormatter={maskCurrency}
                targetFormatter={maskCurrency}
                percentFormatter={(ratio) => formatPercent(ratio, percentFormatter)}
                hideValue={valuesHidden}
                mode="target"
              />
              <div className="text-sm font-semibold text-slate-700">Renda</div>
            </div>

            <div className="flex flex-col items-center gap-5">
              <PieChart
                size={204}
                data={savingPieData(savings, monthlySpend)}
                showLegend={false}
                centerText={maskCurrency(savings)}
                centerTextColor={valuesHidden ? '#ffffff' : savings < 0 ? '#dc2626' : '#16a34a'}
                centerBold
                hoverCenterText={!valuesHidden && hoverSavingsText !== '--' ? hoverSavingsText : undefined}
                hoverCenterTextColor={savingsHoverColor}
                hoverFontScale={1.18}
              />
              <RadialProgress
                value={Math.max(0, savings)}
                target={savingsTarget}
                label="Meta de economia"
                valueFormatter={maskCurrency}
                targetFormatter={maskCurrency}
                percentFormatter={(ratio) => formatPercent(ratio, percentFormatter)}
                hideValue={valuesHidden}
                mode="target"
              />
              <div className="text-sm font-semibold text-slate-700">Economia</div>
            </div>

            <div className="flex flex-col items-center gap-5">
              <PieChart
                size={204}
                data={[
                  { label: 'Abertas/Atrasadas', value: openOrOverdue, color: '#ea580c' },
                  { label: 'Pagas', value: paidInMonth, color: '#fb923c' },
                ]}
                formatValue={(v) => maskCurrency(v)}
                centerText={maskCurrency(openOrOverdue)}
                centerBold
                centerCheck={!valuesHidden && openOrOverdue <= 0}
                showLegend={false}
                hoverCenterText={!valuesHidden && hoverExpensesText !== '--' ? hoverExpensesText : undefined}
                hoverCenterTextColor={expensesHoverColor}
                hoverFontScale={1.18}
              />
              <RadialProgress
                value={monthlySpend}
                target={expensesLimit}
                label="Teto de gastos"
                valueFormatter={maskCurrency}
                targetFormatter={maskCurrency}
                percentFormatter={(ratio) => formatPercent(ratio, percentFormatter)}
                hideValue={valuesHidden}
                mode="ceiling"
              />
              <div className="text-sm font-semibold text-slate-700">Contas</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default TotalsStrip;

function savingPieData(savings: number, expenses: number) {
  const econPositive = Math.max(0, savings);
  if (savings >= 0) {
    return [
      { label: 'Gastos', value: expenses, color: '#1f2937' },
      { label: 'Economia', value: econPositive, color: '#22c55e' },
    ];
  }
  const overspend = Math.abs(savings);
  const withinBudget = Math.max(0, expenses - overspend);
  return [
    { label: 'Dentro da renda', value: withinBudget, color: '#1f2937' },
    { label: 'Déficit', value: overspend, color: '#dc2626' },
  ];
}

