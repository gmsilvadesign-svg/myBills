
import { memo, useMemo } from 'react';
import * as Types from '@/types';
import { parseDate, daysInMonth } from '@/utils/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface TotalsStripProps {
  bills: Types.Bill[];
  incomes: Types.Income[];
  purchases: Types.Purchase[];
  filter?: Types.FilterType;
  valuesHidden?: boolean;
  hideCircles?: boolean;
  onFilterOverdue?: () => void;
}

const maskCurrency = (value: number, format: (v: number) => string, hidden: boolean) =>
  hidden ? '*****' : format(value);

const TotalsStrip = memo(function TotalsStrip({
  bills,
  incomes,
  purchases,
  filter = 'month',
  valuesHidden = false,
  hideCircles = false,
  onFilterOverdue,
}: TotalsStripProps) {
  const { locale, currency } = useTranslation();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { style: 'currency', currency }),
    [locale, currency],
  );

  const inMonth = (iso: string) => {
    const date = parseDate(iso);
    return date.getFullYear() === year && date.getMonth() === month;
  };

  const incomeMonth = incomes.reduce((sum, income) => {
    const base = parseDate(income.dueDate);
    const amount = Number(income.amount || 0);
    switch (income.recurrence) {
      case 'MONTHLY':
        return sum + amount;
      case 'WEEKLY': {
        const weekday = base.getDay();
        let count = 0;
        for (let day = 1; day <= daysInMonth(year, month); day += 1) {
          if (new Date(year, month, day).getDay() === weekday) count += 1;
        }
        return sum + count * amount;
      }
      case 'DAILY':
        return sum + daysInMonth(year, month) * amount;
      case 'YEARLY':
        return base.getMonth() === month ? sum + amount : sum;
      case 'NONE':
      default:
        return inMonth(income.dueDate) ? sum + amount : sum;
    }
  }, 0);

  const billsMetrics = bills.reduce(
    (acc, bill) => {
      const amount = Number(bill.amount || 0);
      const isOverdue = !bill.paid && parseDate(bill.dueDate) < now;
      if (bill.paid && bill.paidOn && inMonth(bill.paidOn)) {
        acc.paid += amount;
        return acc;
      }
      if (!bill.paid && inMonth(bill.dueDate)) {
        if (isOverdue) acc.overdue += amount;
        else acc.open += amount;
      }
      return acc;
    },
    { open: 0, overdue: 0, paid: 0 },
  );

  const purchasesTotal = purchases
    .filter((purchase) => {
      if (filter === 'today') {
        const date = parseDate(purchase.date);
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        );
      }
      if (filter === 'month') return inMonth(purchase.date);
      if (filter === 'all') return true;
      return inMonth(purchase.date);
    })
    .reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);

  if (hideCircles) return null;

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Renda prevista</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {maskCurrency(incomeMonth, formatter.format, valuesHidden)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Contas em aberto</span>
            {onFilterOverdue && (
              <button
                type="button"
                onClick={onFilterOverdue}
                className="text-xs text-amber-700 hover:text-amber-900 transition-colors"
              >
                Ver atrasadas
              </button>
            )}
          </div>
          <div className="text-lg font-semibold text-slate-900">
            {maskCurrency(billsMetrics.open, formatter.format, valuesHidden)}
          </div>
          <div className="text-xs text-slate-600">
            Em atraso: {maskCurrency(billsMetrics.overdue, formatter.format, valuesHidden)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Compras</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {maskCurrency(purchasesTotal, formatter.format, valuesHidden)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TotalsStrip;

