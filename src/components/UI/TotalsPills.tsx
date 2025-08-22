import { memo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Pill from './Pill';
import * as Types from '../../types';
import { fmtMoney } from '../../utils/utils';

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
        {fmtMoney(totals.allOpen, currency, locale)}
      </Pill>
      <Pill tone="blue">
        <span className="hidden sm:inline">{t.totals_month}: </span>
        <span className="sm:hidden">Mês: </span>
        {fmtMoney(totals.monthOpen, currency, locale)}
      </Pill>
      {totals.overdue > 0 && (
        <button
          onClick={onFilterOverdue}
          className="px-2 py-1 rounded-full text-xs min-w-[80px] text-center inline-block bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
        >
          <span className="hidden sm:inline">{t.overdue}: </span>
          <span className="sm:hidden">Atrasadas: </span>
          {fmtMoney(totals.overdue, currency, locale)}
        </button>
      )}
    </div>
  );
});

export default TotalsPills;