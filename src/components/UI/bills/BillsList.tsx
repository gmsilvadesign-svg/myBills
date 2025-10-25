import { memo, useMemo } from 'react';
import Section from '@/components/layout/Section';
import BillRow from '@/components/UI/bills/BillRow';
import * as Types from '@/types';
import { parseDate } from '@/utils/utils';
import { TranslationDictionary } from '@/constants/translation';

type BillOccurrenceMeta = {
  displayKey: string;
  virtual: boolean;
  source: Types.Bill;
  occurrenceDate: string;
  originalDueDate: string;
  timeRelation: "past" | "current" | "future";
};

interface BillsListProps {
  bills: Types.Bill[];
  loading: boolean;
  markPaid: (bill: Types.Bill, advance: boolean) => void;
  unmarkPaid?: (bill: Types.Bill) => void;
  setEditing: (bill: Types.Bill) => void;
  setConfirm: (confirm: Types.ConfirmState) => void;
  t: TranslationDictionary;
  locale: string;
  currency: string;
  purchasesTotalMonth?: number;
  onOpenPurchases?: () => void;
  incomesTotalMonth?: number;
  onOpenIncomes?: () => void;
  hideValues?: boolean;
  referenceMonth?: Date;
}

const BillsList = memo(function BillsList({
  bills,
  loading,
  markPaid,
  unmarkPaid,
  setEditing,
  setConfirm,
  t,
  locale,
  currency,
  hideValues = false,
  referenceMonth: _referenceMonth,
}: BillsListProps) {
  const getMeta = (bill: Types.Bill) =>
    ((bill as any).__meta__ as BillOccurrenceMeta | undefined) ?? undefined;
  const occurrenceDateFor = (bill: Types.Bill) => {
    const meta = getMeta(bill);
    return meta?.occurrenceDate ?? bill.dueDate;
  };
  const displayKeyFor = (bill: Types.Bill) => {
    const meta = getMeta(bill);
    if (meta?.displayKey) return meta.displayKey;
    if (bill.id) return `${bill.id}-${bill.dueDate}`;
    return `${bill.title}-${bill.dueDate}`;
  };

  const sorted = useMemo(() => {
    return bills
      .slice()
      .sort((a, b) => parseDate(occurrenceDateFor(a)).getTime() - parseDate(occurrenceDateFor(b)).getTime());
  }, [bills]);

  const openBills = sorted.filter((bill) => !bill.paid);
  const paidBills = sorted.filter((bill) => bill.paid);

  return (
    <Section>
      <div className="divide-y divide-slate-200 overflow-hidden">
        {loading && (
          <div className="text-slate-600 py-8 text-center flex items-center justify-center min-h-[400px]">
            {t.loading_bills}
          </div>
        )}

        {!loading && openBills.length > 0 &&
          openBills.map((bill) => (
            <BillRow
              key={displayKeyFor(bill)}
              bill={bill}
              markPaid={markPaid}
              setEditing={setEditing}
              setConfirm={setConfirm}
              t={t}
              locale={locale}
              currency={currency}
              hideValues={hideValues}
              occurrenceMeta={getMeta(bill)}
            />
          ))}

        {!loading && paidBills.length > 0 && (
          <div className="pt-6">
            <div className="text-sm font-semibold text-slate-600 pb-2">
              {t.paid_bills || 'Contas pagas'}
            </div>
            <div className="divide-y divide-slate-200">
              {paidBills.map((bill) => (
                <BillRow
                  key={displayKeyFor(bill)}
                  bill={bill}
                  markPaid={markPaid}
                  unmarkPaid={unmarkPaid}
                  paidInCurrentMonth
                  setEditing={setEditing}
                  setConfirm={setConfirm}
                  t={t}
                  locale={locale}
                  currency={currency}
                  hideValues={hideValues}
                  occurrenceMeta={getMeta(bill)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && openBills.length === 0 && paidBills.length === 0 && (
          <div className="text-slate-600 py-8 text-center min-h-[400px] flex items-center justify-center">
            {t.no_bills}
          </div>
        )}
      </div>
    </Section>
  );
});

export default BillsList;
