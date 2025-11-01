import { useMemo } from 'react';
import { parseDate, ymd } from '@/utils/utils';
import * as Types from '@/types';
import {
  BillOccurrenceSummary,
  collectBillOccurrencesForMonth,
  collectBillOccurrencesUpToMonth,
} from '@/utils/billOccurrences';

type BillOccurrenceMeta = {
  displayKey: string;
  virtual: boolean;
  source: Types.Bill;
  occurrenceDate: string;
  originalDueDate: string;
  timeRelation: "past" | "current" | "future";
  pendingOverdue?: boolean;
  oldestPendingOccurrence?: string;
};

type BillWithMeta = Types.Bill & {
  __meta__?: BillOccurrenceMeta;
};

const buildBillWithMeta = (
  summary: BillOccurrenceSummary,
  now: Date,
  options: { forcePaid?: boolean; virtualOverride?: boolean } = {},
): BillWithMeta => {
  const clone: BillWithMeta = { ...summary.bill };
  clone.paid = options.forcePaid ?? summary.paid;
  clone.paidOn = summary.paidOn;

  const occurrenceDate = parseDate(summary.occurrence);
  const occurrenceKey = occurrenceDate.getFullYear() * 12 + occurrenceDate.getMonth();
  const currentKey = now.getFullYear() * 12 + now.getMonth();

  clone.__meta__ = {
    displayKey: `${summary.bill.id || summary.bill.title}-${summary.occurrence}`,
    virtual:
      options.virtualOverride !== undefined
        ? options.virtualOverride
        : summary.occurrence !== summary.bill.dueDate,
    source: summary.bill,
    originalDueDate: summary.bill.dueDate,
    occurrenceDate: summary.occurrence,
    timeRelation:
      occurrenceKey < currentKey
        ? "past"
        : occurrenceKey > currentKey
          ? "future"
          : "current",
    pendingOverdue: summary.pendingOverdue,
    oldestPendingOccurrence: summary.oldestPendingOccurrence ?? undefined,
  };

  return clone;
};

export default function useFilteredBills(
  bills: Types.Bill[],
  filter: Types.FilterType,
  search: string,
  referenceMonth?: Date,
) {
  const todayISO = ymd(new Date());
  const referenceKey = referenceMonth
    ? `${referenceMonth.getFullYear()}-${referenceMonth.getMonth()}`
    : 'current';

  return useMemo(() => {
    const monthRef = referenceMonth ?? new Date();
    const targetMonth = monthRef.getMonth();
    const targetYear = monthRef.getFullYear();
    const now = new Date();

    return bills
      .flatMap<BillWithMeta>((bill) => {
        const matchesSearch = [bill.title, bill.category, (bill.tags || []).join(','), bill.notes]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());
        if (!matchesSearch) return [];
        if (filter === 'overdue') {
          const today = new Date();
          const summaries = collectBillOccurrencesUpToMonth(
            bill,
            today.getFullYear(),
            today.getMonth(),
            today,
          );
          return summaries
            .filter((summary) => !summary.paid && parseDate(summary.occurrence) < today)
            .map((summary) => buildBillWithMeta(summary, now, { forcePaid: false, virtualOverride: true }));
        }

        const summaries = collectBillOccurrencesForMonth(
          bill,
          targetYear,
          targetMonth,
          now,
        );
        if (!summaries.length) return [];
        return summaries.map((summary) => buildBillWithMeta(summary, now));
      })
        .filter((bill) => {
          if (filter === 'paid') {
            return bill.paid;
          }
          if (filter === 'pending') {
            return !bill.paid;
          }
          return true;
        });
  }, [bills, filter, search, todayISO, referenceKey]);
}


