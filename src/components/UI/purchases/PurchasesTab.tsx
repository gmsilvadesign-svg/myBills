import Section from '@/components/layout/Section';
import * as Types from '@/types';

interface PurchasesTabProps {
  purchases: Types.Purchase[];
  onEdit: (purchase: Types.Purchase) => void;
  onRemove: (id: string) => void;
  t: Record<string, string>;
  locale: string;
  currency: string;
  filter?: Types.FilterType;
}

export default function PurchasesTab({ purchases, onEdit, onRemove, t, locale, currency, filter = 'month' }: PurchasesTabProps) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const isToday = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };
  const inMonth = (iso: string) => { const d = new Date(iso); return d.getFullYear() === y && d.getMonth() === m; };
  const filtered = purchases.filter(p => filter === 'today' ? isToday(p.date) : filter === 'month' ? inMonth(p.date) : true);
  const total = filtered.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <Section title={t.purchases || 'Compras'}>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{t.monthly_purchases || 'Compras do mês'}</h3>
          <div className="text-sm font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(total)}</div>
        </div>
        {filtered.length === 0 && (
          <div className="text-slate-500 text-center py-8">{t.no_purchases || 'Nenhuma compra registrada neste mês.'}</div>
        )}
        {filtered.length > 0 && (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filtered.map(p => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.date}{p.category ? ` • ${p.category}` : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(p.amount)}</div>
                  <button onClick={() => onEdit(p)} className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white text-sm">{t.edit || 'Editar'}</button>
                  {p.id && (
                    <button onClick={() => onRemove(p.id!)} className="text-red-600 hover:text-red-700 text-sm">{t.delete || 'Excluir'}</button>
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
