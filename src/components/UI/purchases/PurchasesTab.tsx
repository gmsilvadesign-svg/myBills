import Section from '@/components/layout/Section';
import PurchaseRow from '@/components/UI/purchases/PurchaseRow';
import * as Types from '@/types';
import { fmtMoneyTruncated } from '@/utils/utils';
import { TranslationDictionary } from '@/constants/translation';

interface PurchasesTabProps {
  purchases: Types.Purchase[];
  onEdit: (purchase: Types.Purchase) => void;
  onRemove: (id: string) => void;
  t: TranslationDictionary;
  locale: string;
  currency: string;
  filter?: Types.FilterType;
  hideValues?: boolean;
  referenceMonth?: Date;
}

export default function PurchasesTab({
  purchases,
  onEdit,
  onRemove,
  t,
  locale,
  currency,
  filter = 'month',
  hideValues = false,
  referenceMonth,
}: PurchasesTabProps) {
  const today = new Date();
  const monthRef = referenceMonth ?? today;
  const y = monthRef.getFullYear();
  const m = monthRef.getMonth();

  const isToday = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };

  const inMonth = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === y && d.getMonth() === m;
  };

  const filtered = purchases.filter((purchase) =>
    filter === 'today' ? isToday(purchase.date) : filter === 'month' ? inMonth(purchase.date) : true,
  );

  const total = filtered.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  const totalFormatted = hideValues ? '*****' : fmtMoneyTruncated(total, currency, locale);

  return (
    <Section title={t.purchases || 'Compras'}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">{t.monthly_purchases || 'Compras do mês'}</h3>
        <span className="text-sm font-semibold text-slate-900">{totalFormatted}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-slate-600 text-center py-8">{t.no_purchases || 'Nenhuma compra registrada neste mês.'}</div>
      ) : (
        <div>
          {filtered.map((purchase) => (
            <PurchaseRow
              key={purchase.id ?? `${purchase.title}-${purchase.date}`}
              purchase={purchase}
              onEdit={onEdit}
              onRemove={onRemove}
              locale={locale}
              currency={currency}
              t={t}
              hideValues={hideValues}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
