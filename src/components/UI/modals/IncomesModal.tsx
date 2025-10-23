import { useEffect } from 'react';
import * as Types from '@/types';
import { occurrencesForBillInMonth } from '@/utils/utils';
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
}

export default function IncomesModal({ open, onClose, incomes, onEdit, onDelete, t, locale, currency }: IncomesModalProps) {
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [open, onClose]);

  if (!open) return null;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const inMonth = (i: Types.Income) => {
    try { return occurrencesForBillInMonth({ dueDate: i.dueDate, recurrence: i.recurrence } as any, y, m).length > 0; }
    catch { const d = new Date(i.dueDate); return d.getFullYear() === y && d.getMonth() === m; }
  };
  const monthIncomes = incomes.filter(inMonth);
  const total = monthIncomes.reduce((s, it) => s + Number(it.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white text-slate-900 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.monthly_incomes || 'Rendas do mês'}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-100">{t.close || 'Fechar'}</button>
        </div>
        <div className="text-sm mb-2">{t.total || 'Total'}: <span className="overflow-hidden text-ellipsis inline-block max-w-[200px]" title={new Intl.NumberFormat(locale, { style: 'currency', currency }).format(total)}>{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(total)}</span></div>
        <ul className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
          {monthIncomes.length === 0 && <li className="py-6 text-center text-slate-600">{t.no_incomes || 'Nenhuma renda registrada neste mês.'}</li>}
          {monthIncomes.slice(0, 1).map((it) => (
            <li key={it.id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate" title={it.title}>{it.title}</div>
                <div className="text-xs text-slate-600">{it.dueDate}{it.category ? ` • ${it.category}` : ''}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-sm font-semibold min-w-[110px] text-right overflow-hidden text-ellipsis" title={new Intl.NumberFormat(locale, { style: 'currency', currency }).format(it.amount)}>
                  {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(it.amount)}
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit(it)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                  >
                    {t.edit}
                  </button>
                )}
                {onDelete && it.id && (
                  <button
                    onClick={() => onDelete(it.id!)}
                    className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    {t.delete}
                  </button>
                )}
              </div>
            </li>
          ))}
          {monthIncomes.length > 1 && (
            <li className="py-3 text-center text-sm text-slate-600">
              +{monthIncomes.length - 1} mais...
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}


