import { memo } from 'react';
import Pill from '@/components/UI/Pill';
import { fmtMoneyTruncated, formatDate } from '@/utils/utils';
import * as Types from '@/types';
import { TranslationDictionary } from '@/constants/translation';

interface IncomeRowProps {
  income: Types.Income;
  occurrenceDate?: string;
  onEdit: (income: Types.Income) => void;
  onRemove: (id: string) => void;
  locale: string;
  currency: string;
  t: TranslationDictionary;
  hideValues?: boolean;
}

const recurrenceLabels = (t: TranslationDictionary) => ({
  DAILY: t.daily,
  WEEKLY: t.weekly,
  MONTHLY: t.monthly,
  YEARLY: t.yearly,
});

const IncomeRow = memo(function IncomeRow({
  income,
  occurrenceDate,
  onEdit,
  onRemove,
  locale,
  currency,
  t,
  hideValues = false,
}: IncomeRowProps) {
  const labels = recurrenceLabels(t);
  const recurrence =
    income.recurrence === 'NONE' ? null : labels[income.recurrence] ?? income.recurrence.toLowerCase();

  const formattedAmount = hideValues
    ? '*****'
    : fmtMoneyTruncated(typeof income.amount === 'number' ? income.amount : Number(income.amount || 0), currency, locale);

  const formattedDate = formatDate(occurrenceDate ?? income.dueDate, locale);

  return (
    <div className="py-4 px-4 hover:bg-slate-50 rounded-lg border-b border-slate-100 last:border-b-0 transition-colors duration-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex flex-1 items-start gap-4 min-w-0">
          <div className="flex flex-col gap-2">
            {income.category && (
              <Pill>
                <span className="whitespace-nowrap">{income.category.length > 12 ? `${income.category.slice(0, 12)}...` : income.category}</span>
              </Pill>
            )}
            {recurrence && (
              <Pill>
                <span className="whitespace-nowrap">{recurrence}</span>
              </Pill>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base text-slate-900 truncate">{income.title}</div>
            <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{formattedDate}</span>
              {income.notes && <span className="truncate max-w-full">{income.notes}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="font-bold text-lg text-slate-900">{formattedAmount}</div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(income);
            }}
            className="px-2 py-2 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            aria-label={`${t.edit} ${income.title}`}
            title={t.edit}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {income.id && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove(income.id!);
              }}
              className="px-2 py-2 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
              aria-label={`${t.delete} ${income.title}`}
              title={t.delete}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default IncomeRow;
