// React
import { memo } from 'react';

// Hooks
import { useTranslation } from '@/hooks/useTranslation';

// Components
import Pill from './Pill';

// Utils
import { fmtMoney, fmtMoneyTruncated } from '@/utils/utils';

// Types
import * as Types from '@/types';

interface TotalsPillsProps {
  totals: Types.Totals;
  onFilterOverdue?: () => void;
}

const TotalsPills = memo(function TotalsPills({ totals, onFilterOverdue }: TotalsPillsProps) {
  const { t, locale, currency } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
      <Pill tone="amber">
        <span className="hidden sm:inline">{t.totals_open}: </span>
        <span className="sm:hidden">Abertas: </span>
        <span className="overflow-hidden text-ellipsis" title={fmtMoney(totals.allOpen, currency, locale)}>
          {fmtMoneyTruncated(totals.allOpen, currency, locale, 12)}
        </span>
      </Pill>
      <Pill tone="blue">
        <span className="hidden sm:inline">{t.totals_month}: </span>
        <span className="sm:hidden">Mês: </span>
        <span className="overflow-hidden text-ellipsis" title={fmtMoney(totals.monthOpen, currency, locale)}>
          {fmtMoneyTruncated(totals.monthOpen, currency, locale, 12)}
        </span>
      </Pill>
      {totals.overdue > 0 && (
        <button
          onClick={onFilterOverdue}
          className="px-2 py-1 rounded-full text-xs min-w-[80px] text-center inline-block bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
        >
          <span className="hidden sm:inline">{t.overdue}: </span>
          <span className="sm:hidden">Atrasadas: </span>
          <span className="overflow-hidden text-ellipsis" title={fmtMoney(totals.overdue, currency, locale)}>
            {fmtMoneyTruncated(totals.overdue, currency, locale, 12)}
          </span>
        </button>
      )}
    </div>
  );
});

export default TotalsPills;