import Section from '@/components/layout/Section';
import * as Types from '@/types';
import { occurrencesForBillInMonth, ymd } from '@/utils/utils';
import { TranslationDictionary } from '@/constants/translation';

interface IncomesTabProps {
  incomes: Types.Income[];
  onEdit: (income: Types.Income) => void;
  onRemove: (id: string) => void;
  t: TranslationDictionary;
  locale: string;
  currency: string;
  filter?: Types.FilterType;
  hideValues?: boolean;
  referenceMonth?: Date;
}

export default function IncomesTab({
  incomes,
  onEdit,
  onRemove,
  t,
  locale,
  currency,
  filter = 'month',
  hideValues = false,
  referenceMonth,
}: IncomesTabProps) {
  const today = new Date();
  const monthRef = referenceMonth ?? today;
  const y = monthRef.getFullYear();
  const m = monthRef.getMonth();
  const isToday = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };
  const hasOccurrenceThisMonth = (inc: Types.Income) => {
    try {
      return occurrencesForBillInMonth(
        { dueDate: inc.dueDate, recurrence: inc.recurrence } as any,
        y,
        m,
      ).length > 0;
    } catch {
      const d = new Date(inc.dueDate);
      return d.getFullYear() === y && d.getMonth() === m;
    }
  };
  const hasOccurrenceToday = (inc: Types.Income) => {
    try {
      return occurrencesForBillInMonth(
        { dueDate: inc.dueDate, recurrence: inc.recurrence } as any,
        today.getFullYear(),
        today.getMonth(),
      ).some((d) => d === ymd(today));
    } catch {
      return isToday(inc.dueDate);
    }
  };

  const filtered = incomes.filter((i) =>
    filter === 'today' ? hasOccurrenceToday(i) : filter === 'month' ? hasOccurrenceThisMonth(i) : true,
  );
  const total = filtered.reduce((s, i) => s + Number(i.amount || 0), 0);

  return (
    <Section title={t.monthly_incomes || 'Rendas do mês'}>
      <div className="rounded-2xl border border-slate-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{t.monthly_incomes || 'Rendas do mês'}</h3>
          <div className="text-sm font-semibold">{hideValues ? "••••••" : new Intl.NumberFormat(locale, { style: 'currency', currency }).format(total)}</div>
        </div>
        {filtered.length === 0 && (
          <div className="text-slate-600 text-center py-8">{t.no_incomes || 'Nenhuma renda registrada neste mês.'}</div>
        )}
        {filtered.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {filtered.map(i => (
              <li key={i.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-slate-600">{i.dueDate}{i.category ? ` • ${i.category}` : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold">{hideValues ? "••••••" : new Intl.NumberFormat(locale, { style: 'currency', currency }).format(i.amount)}</div>
                  <button onClick={() => onEdit(i)} className="text-slate-600 hover:text-slate-800 text-sm">{t.edit || 'Editar'}</button>
                  {i.id && (
                    <button onClick={() => onRemove(i.id!)} className="text-red-600 hover:text-red-700 text-sm">{t.delete || 'Excluir'}</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}


