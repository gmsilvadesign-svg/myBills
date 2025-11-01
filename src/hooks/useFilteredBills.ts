import { useMemo } from 'react';
import { occurrencesForBillInMonth, parseDate, isBefore, isSameDayISO, ymd } from '@/utils/utils';
import * as Types from '@/types';

const MAX_OVERDUE_MONTHS = 60;

type BillOccurrenceMeta = {
  displayKey: string;
  virtual: boolean;
  source: Types.Bill;
  occurrenceDate: string;
  originalDueDate: string;
  timeRelation: "past" | "current" | "future";
};

type BillWithMeta = Types.Bill & {
  __meta__?: BillOccurrenceMeta;
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
    const currentKey = now.getFullYear() * 12 + now.getMonth();

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
          const todayKey = today.getFullYear() * 12 + today.getMonth();
          const paidOnDate = bill.paidOn ? parseDate(bill.paidOn) : null;
          const paidOnTime = paidOnDate ? paidOnDate.getTime() : null;
          const overdueOccurrences: BillWithMeta[] = [];

          const pushOccurrence = (occurrenceISO: string, virtual: boolean) => {
            const occurrenceDate = parseDate(occurrenceISO);
            if (occurrenceDate >= today) return;
            if (bill.paid && paidOnTime !== null && occurrenceDate.getTime() <= paidOnTime) return;
            const clone: BillWithMeta = { ...bill, paid: false, paidOn: null };
            clone.__meta__ = {
              displayKey: `${bill.id || bill.title}-overdue-${occurrenceISO}`,
              virtual,
              source: bill,
              occurrenceDate: occurrenceISO,
              originalDueDate: bill.dueDate,
              timeRelation: "past",
            };
            overdueOccurrences.push(clone);
          };

          if (!bill.recurrence || bill.recurrence === "NONE") {
            if (!bill.paid && isBefore(bill.dueDate, todayISO)) {
              pushOccurrence(bill.dueDate, false);
            }
            return overdueOccurrences;
          }

          const baseDate = parseDate(bill.dueDate);
          const startKey = baseDate.getFullYear() * 12 + baseDate.getMonth();
          const limitKey = Math.min(todayKey, startKey + MAX_OVERDUE_MONTHS);

          for (let key = startKey; key <= limitKey; key += 1) {
            const year = Math.floor(key / 12);
            const month = key % 12;
            const monthOccurrences = occurrencesForBillInMonth(bill, year, month);
            monthOccurrences.forEach((occurrenceISO) => pushOccurrence(occurrenceISO, true));
          }

          return overdueOccurrences;
        }

        const occurrences = occurrencesForBillInMonth(bill, targetYear, targetMonth);
        if (!occurrences.length) return [];

        return occurrences.map((occurrence) => {
          const isSameAsBase = occurrence === bill.dueDate;
          const occurrenceDate = parseDate(occurrence);
          const occurrenceKey =
            occurrenceDate.getFullYear() * 12 + occurrenceDate.getMonth();
          const isPastOccurrence = occurrenceKey < currentKey;
          const isFutureOccurrence = occurrenceKey > currentKey;
          const paidOnDate = bill.paidOn ? parseDate(bill.paidOn) : null;
          const paidOnTime = paidOnDate ? paidOnDate.getTime() : null;
          const occurrenceTime = occurrenceDate.getTime();
          const isOccurrencePaid = (() => {
            if (isSameAsBase) {
              return Boolean(bill.paid);
            }
            if (!paidOnDate) return false;
            return paidOnTime! >= occurrenceTime;
          })();
          const resolvedPaidOn = (() => {
            if (!isOccurrencePaid) return null;
            if (bill.paidOn && isSameDayISO(bill.paidOn, occurrence)) {
              return bill.paidOn;
            }
            if (bill.paidOn && paidOnDate && paidOnDate.getFullYear() === occurrenceDate.getFullYear() && paidOnDate.getMonth() === occurrenceDate.getMonth()) {
              return bill.paidOn;
            }
            return occurrence;
          })();
          const clone: BillWithMeta = isSameAsBase ? { ...bill } : { ...bill };
          if (!isSameAsBase) {
            clone.paid = isOccurrencePaid;
            clone.paidOn = resolvedPaidOn;
          }
          clone.__meta__ = {
            displayKey: `${bill.id || bill.title}-${occurrence}`,
            virtual: !isSameAsBase,
            source: bill,
            originalDueDate: bill.dueDate,
            occurrenceDate: occurrence,
            timeRelation: isPastOccurrence
              ? "past"
              : isFutureOccurrence
                ? "future"
                : "current",
          };
          return clone;
        });
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
