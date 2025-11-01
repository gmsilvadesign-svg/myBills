import { memo, useMemo } from "react";

import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/styles/constants";

interface TotalsStripTotals {
  bills: {
    open: number;
    overdue: number;
    paid: number;
    total: number;
  };
  income: number;
  purchases: number;
}

interface TotalsStripProps {
  totals: TotalsStripTotals;
  valuesHidden?: boolean;
  hideCircles?: boolean;
  onFilterOverdue?: () => void;
}

const maskCurrency = (value: number, format: (v: number) => string, hidden: boolean) =>
  hidden ? "*****" : format(value);

const TotalsStrip = memo(function TotalsStrip({
  totals,
  valuesHidden = false,
  hideCircles = false,
  onFilterOverdue,
}: TotalsStripProps) {
  const { locale, currency } = useTranslation();

  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency }),
    [locale, currency],
  );

  const incomeMonth = totals.income;
  const billsMetrics = totals.bills;
  const purchasesTotal = totals.purchases;

  const totalBills = billsMetrics.open + billsMetrics.overdue + billsMetrics.paid;
  const economy = incomeMonth - totalBills - purchasesTotal;
  const economyClass = valuesHidden
    ? "text-slate-900"
    : economy >= 0
      ? "text-emerald-600"
      : "text-rose-600";

  if (hideCircles) return null;

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-4 gap-4">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Economia</div>
          <div className={cn("mt-2 text-2xl font-semibold", economyClass)}>
            {maskCurrency(economy, formatter.format, valuesHidden)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TotalsStrip;
