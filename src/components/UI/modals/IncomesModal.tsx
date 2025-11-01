import { useEffect } from 'react';
import * as Types from '@/types';
import { occurrencesForIncomeInMonth } from '@/utils/utils';
import { TranslationDictionary } from '@/constants/translation';

interface IncomesModalProps {
  open: boolean;
  onClose: () => void;
  incomes: Types.Income[];
  onEdit?: (income: Types.Income) => void;
  onDelete?: (id: string) => void;
  t: TranslationDictionary;
  locale: string;
  currency: string;
  referenceMonth?: Date;
}

export default function IncomesModal({
  open,
  onClose,
  incomes,
  onEdit,
  onDelete,
  t,
  locale,
  currency,
  referenceMonth,
}: IncomesModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const monthRef = referenceMonth ? new Date(referenceMonth) : new Date();
  const year = monthRef.getFullYear();
  const monthIndex = monthRef.getMonth();

  const monthIncomes = incomes.flatMap((income) => {
    const occurrences = occurrencesForIncomeInMonth(income, year, monthIndex);
    if (!occurrences.length) return [] as { income: Types.Income; occurrence: string }[];
    return occurrences.map((occurrence) => ({ income, occurrence }));
  });

  const totalAmount = monthIncomes.reduce((sum, entry) => sum + Number(entry.income.amount || 0), 0);
  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  const formatDate = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white text-slate-900 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.monthly_incomes || 'Rendas do mes'}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-100">{t.close || 'Fechar'}</button>
        </div>
        <div className="text-sm mb-2">
          {t.total || 'Total'}{' '}
          <span
            className="overflow-hidden text-ellipsis inline-block max-w-[200px]"
            title={formatCurrency(totalAmount)}
          >
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <ul className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
          {monthIncomes.length === 0 && (
            <li className="py-6 text-center text-slate-600">
              {t.no_incomes || 'Nenhuma renda registrada neste mes.'}
            </li>
          )}
          {monthIncomes.map(({ income, occurrence }, index) => (
            <li
              key={`${income.id ?? income.title}-${occurrence}-${index}`}
              className="py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate" title={income.title}>{income.title}</div>
                <div className="text-xs text-slate-600">
                  {formatDate.format(new Date(occurrence))}
                  {income.category ? ` - ${income.category}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="text-sm font-semibold min-w-[110px] text-right overflow-hidden text-ellipsis"
                  title={formatCurrency(Number(income.amount || 0))}
                >
                  {formatCurrency(Number(income.amount || 0))}
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit(income)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                    aria-label={t.edit}
                    title={t.edit}
                  >
                    {t.edit}
                  </button>
                )}
                {onDelete && income.id && (
                  <button
                    onClick={() => onDelete(income.id!)}
                    className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs"
                    aria-label={t.delete}
                    title={t.delete}
                  >
                    {t.delete}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}