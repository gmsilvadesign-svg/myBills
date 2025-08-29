import { useEffect } from 'react';
import * as Types from '@/types';

interface PurchasesModalProps {
  open: boolean;
  onClose: () => void;
  purchases: Types.Purchase[];
  onEdit?: (purchase: Types.Purchase) => void;
  onDelete?: (id: string) => void;
  t: Record<string, string>;
  locale: string;
  currency: string;
}

export default function PurchasesModal({ open, onClose, purchases, onEdit, onDelete, t, locale, currency }: PurchasesModalProps) {
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
  const monthPurchases = purchases.filter(p => { const d = new Date(p.date); return d.getFullYear() === y && d.getMonth() === m; });
  const total = monthPurchases.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.monthly_purchases || 'Compras do mês'}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700">{t.close || 'Fechar'}</button>
        </div>
        <div className="text-sm mb-2">{t.total || 'Total'}: {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(total)}</div>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-80 overflow-y-auto">
          {monthPurchases.map(p => (
            <li key={p.id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate" title={p.title}>{p.title}</div>
                <div className="text-xs text-slate-500">{p.date}{p.category ? ` • ${p.category}` : ''}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-sm font-semibold min-w-[110px] text-right">
                  {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(p.amount)}
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit(p)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs"
                    aria-label={t.edit}
                    title={t.edit}
                  >
                    {t.edit}
                  </button>
                )}
                {onDelete && p.id && (
                  <button
                    onClick={() => onDelete(p.id!)}
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
          {monthPurchases.length === 0 && <li className="py-6 text-center text-slate-500">{t.no_purchases || 'Nenhuma compra registrada neste mês.'}</li>}
        </ul>
      </div>
    </div>
  );
}
