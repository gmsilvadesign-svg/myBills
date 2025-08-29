import { memo } from 'react';
import { fmtMoney } from '@/utils/utils';
import { useTranslation } from '@/hooks/useTranslation';
import * as Types from '@/types';

interface TotalsStripProps {
  totals: Types.Totals;
  onFilterOverdue?: () => void;
}

const TotalsStrip = memo(function TotalsStrip({ totals, onFilterOverdue }: TotalsStripProps) {
  const { t, locale, currency } = useTranslation();

  return (
    <div className="w-full flex items-center justify-center mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-4xl">
        <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 text-center shadow-sm">
          <div className="text-xs sm:text-sm font-medium">{t.totals_open}</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(totals.allOpen, currency, locale)}</div>
        </div>
        <div className="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 text-center shadow-sm">
          <div className="text-xs sm:text-sm font-medium">{t.totals_month}</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(totals.monthOpen, currency, locale)}</div>
        </div>
        <button
          onClick={onFilterOverdue}
          className="rounded-xl p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          <div className="text-xs sm:text-sm font-medium">{t.overdue}</div>
          <div className="text-base sm:text-lg font-semibold">{fmtMoney(totals.overdue, currency, locale)}</div>
        </button>
      </div>
    </div>
  );
});

export default TotalsStrip;

