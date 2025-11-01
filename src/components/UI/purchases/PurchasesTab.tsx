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
  hideValues = false,
  referenceMonth,
}: PurchasesTabProps) {
  const monthRef = referenceMonth ?? new Date();
  const y = monthRef.getFullYear();
  const m = monthRef.getMonth();

  const inMonth = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === y && d.getMonth() === m;
  };

  const purchasesForMonth = purchases.filter((purchase) => inMonth(purchase.date));

  const total = purchasesForMonth.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  const totalFormatted = hideValues ? '*****' : fmtMoneyTruncated(total, currency, locale);

  return (
    <Section title={t.purchases || 'Compras'}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">{t.monthly_purchases || 'Compras do mes'}</h3>
        <span className="text-sm font-semibold text-slate-900">{totalFormatted}</span>
      </div>

      {purchasesForMonth.length === 0 ? (
        <div className="text-slate-600 text-center py-8">{t.no_purchases || 'Nenhuma compra registrada neste mes.'}</div>
      ) : (
        <div>
          {purchasesForMonth.map((purchase) => (
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
