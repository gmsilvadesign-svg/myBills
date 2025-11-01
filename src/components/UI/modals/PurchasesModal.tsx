import { useEffect } from 'react';
import * as Types from '@/types';
import { TranslationDictionary } from '@/constants/translation';

interface PurchasesModalProps {
  open: boolean;
  onClose: () => void;
  purchases: Types.Purchase[];
  onEdit?: (purchase: Types.Purchase) => void;
  onDelete?: (id: string) => void;
  t: TranslationDictionary;
  locale: string;
  currency: string;
  referenceMonth?: Date;
}

export default function PurchasesModal({
  open,
  onClose,
  purchases,
  onEdit,
  onDelete,
  t,
  locale,
  currency,
  referenceMonth,
}: PurchasesModalProps) {
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

  const monthPurchases = purchases.filter((purchase) => {
    const date = new Date(purchase.date);
    return date.getFullYear() === year && date.getMonth() === monthIndex;
  });

  const totalAmount = monthPurchases.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  const formatDate = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white text-slate-900 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.monthly_purchases || 'Compras do mes'}</h2>
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
          {monthPurchases.length === 0 && (
            <li className="py-6 text-center text-slate-600">
              {t.no_purchases || 'Nenhuma compra registrada neste mes.'}
            </li>
          )}
          {monthPurchases.map((purchase) => (
            <li
              key={purchase.id ?? `${purchase.title}-${purchase.date}`}
              className="py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate" title={purchase.title}>{purchase.title}</div>
                <div className="text-xs text-slate-600">
                  {formatDate.format(new Date(purchase.date))}
                  {purchase.category ? ` - ${purchase.category}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="text-sm font-semibold min-w-[110px] text-right overflow-hidden text-ellipsis"
                  title={formatCurrency(Number(purchase.amount || 0))}
                >
                  {formatCurrency(Number(purchase.amount || 0))}
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit(purchase)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                    aria-label={t.edit}
                    title={t.edit}
                  >
                    {t.edit}
                  </button>
                )}
                {onDelete && purchase.id && (
                  <button
                    onClick={() => onDelete(purchase.id!)}
                    className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs"
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