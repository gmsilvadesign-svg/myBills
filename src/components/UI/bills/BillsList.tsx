import { memo } from 'react'
import Section from '@/components/layout/Section'
import BillRow from '@/components/UI/bills/BillRow'
import * as Types from '@/types'
import { parseDate } from '@/utils/utils'

interface BillsListProps {
  bills: Types.Bill[];
  loading: boolean;
  markPaid: (bill: Types.Bill, advance: boolean) => void;
  unmarkPaid?: (bill: Types.Bill) => void;
  setEditing: (bill: Types.Bill) => void;
  setConfirm: (confirm: Types.ConfirmState) => void;
  t: Record<string, string>;
  locale: string;
  currency: string;
  purchasesTotalMonth?: number;
  onOpenPurchases?: () => void;
  incomesTotalMonth?: number;
  onOpenIncomes?: () => void;
  hideValues?: boolean;
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
}: BillsListProps) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const inMonth = (iso?: string | null) => {
    if (!iso) return false
    const d = parseDate(iso)
    return d.getFullYear() === y && d.getMonth() === m
  }
  const isPaidThisMonth = (b: Types.Bill) => !!b.paidOn && inMonth(b.paidOn)
  const openBills = bills.filter(b => !isPaidThisMonth(b))
  const paidBills = bills.filter(isPaidThisMonth)
  return (
    <Section>
      <div className="divide-y divide-slate-200 dark:divide-[#AABBCC]/30 overflow-hidden">
        {loading && (
          <div className="text-slate-500 py-8 text-center flex items-center justify-center min-h-[400px]">
            {t.loading_bills}
          </div>
        )}

        {!loading && openBills.length > 0 &&
          openBills.map((b) => (
            <BillRow
              key={b.id}
              bill={b}
              markPaid={markPaid}
              setEditing={setEditing}
              setConfirm={setConfirm}
              t={t}
              locale={locale}
              currency={currency}
              hideValues={hideValues}
            />
          ))}

        {!loading && paidBills.length > 0 && (
          <div className="pt-6">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 pb-2">
              {t.paid_bills || 'Contas pagas'}
            </div>
            <div className="divide-y divide-slate-200 dark:divide-[#AABBCC]/30">
              {paidBills.map((b) => (
                <BillRow
                  key={b.id}
                  bill={b}
                  markPaid={markPaid}
                  unmarkPaid={unmarkPaid}
                  paidInCurrentMonth
                  setEditing={setEditing}
                  setConfirm={setConfirm}
                  t={t}
                  locale={locale}
                  currency={currency}
                  hideValues={hideValues}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && openBills.length === 0 && paidBills.length === 0 && (
          <div className="text-slate-500 py-8 text-center min-h-[400px] flex items-center justify-center">
            {t.no_bills}
          </div>
        )}
      </div>
    </Section>
  )
})

export default BillsList
