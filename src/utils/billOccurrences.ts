import * as Types from "@/types";
import { occurrencesForBillInMonth, parseDate, ymd } from "@/utils/utils";

const normalizeISO = (iso: string) => ymd(parseDate(iso));

const makeMonthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();

const isOccurrenceCleared = (bill: Types.Bill, iso: string) => {
  if (bill.clearedOccurrences && bill.clearedOccurrences[iso]) {
    return true;
  }
  if (iso === bill.dueDate) {
    return Boolean(bill.paid);
  }
  return false;
};

export function findOldestPendingOccurrence(
  bill: Types.Bill,
  occurrenceISO: string,
  referenceDate: Date = new Date(),
): string | null {
  const occurrenceDate = parseDate(occurrenceISO);
  const reference = new Date(referenceDate);
  reference.setHours(0, 0, 0, 0);

  let oldest: string | null = null;

  const considerOccurrence = (iso: string) => {
    const normalized = normalizeISO(iso);
    if (isOccurrenceCleared(bill, normalized)) {
      return;
    }
    const date = parseDate(normalized);
    if (date >= occurrenceDate) return;
    if (date >= reference) return;
    if (!oldest || parseDate(normalized) < parseDate(oldest)) {
      oldest = normalized;
    }
  };

  if (!bill.recurrence || bill.recurrence === "NONE") {
    considerOccurrence(bill.dueDate);
    return oldest;
  }

  const baseDate = parseDate(bill.dueDate);
  const startKey = makeMonthKey(baseDate);
  const occurrenceKey = makeMonthKey(occurrenceDate);
  const referenceKey = makeMonthKey(reference);
  const limitKey = Math.min(occurrenceKey, referenceKey);

  for (let key = startKey; key <= limitKey; key += 1) {
    const year = Math.floor(key / 12);
    const month = key % 12;
    const monthOccurrences = occurrencesForBillInMonth(bill, year, month);
    for (const iso of monthOccurrences) {
      considerOccurrence(iso);
    }
  }

  return oldest;
}

export interface BillOccurrenceSummary {
  bill: Types.Bill;
  occurrence: string;
  amount: number;
  paid: boolean;
  paidOn: string | null;
  cleared: boolean;
  pendingOverdue: boolean;
  oldestPendingOccurrence: string | null;
}

const buildSummary = (
  bill: Types.Bill,
  occurrenceISO: string,
  referenceDate: Date,
): BillOccurrenceSummary => {
  const clearedMap = bill.clearedOccurrences ?? {};
  const clearedOn = clearedMap[occurrenceISO] ?? null;
  const dueISO = normalizeISO(bill.dueDate);
  const isBaseOccurrence = occurrenceISO === dueISO;
  const paid = Boolean(clearedOn) || (isBaseOccurrence && Boolean(bill.paid));
  const paidOn = clearedOn ?? (isBaseOccurrence ? bill.paidOn ?? null : null);
  const oldestPending = findOldestPendingOccurrence(bill, occurrenceISO, referenceDate);

  return {
    bill,
    occurrence: occurrenceISO,
    amount: Number(bill.amount || 0),
    paid,
    paidOn,
    cleared: Boolean(clearedOn),
    pendingOverdue: Boolean(oldestPending),
    oldestPendingOccurrence: oldestPending ?? null,
  };
};

const isSameMonthISO = (iso: string, year: number, monthIndex: number) => {
  const date = parseDate(iso);
  return date.getFullYear() === year && date.getMonth() === monthIndex;
};

export function collectBillOccurrencesForMonth(
  bill: Types.Bill,
  year: number,
  monthIndex: number,
  referenceDate: Date = new Date(),
): BillOccurrenceSummary[] {
  const clearedMap = bill.clearedOccurrences ?? {};
  const occurrences = new Set<string>();

  Object.keys(clearedMap).forEach((iso) => {
    if (isSameMonthISO(iso, year, monthIndex)) {
      occurrences.add(normalizeISO(iso));
    }
  });

  occurrencesForBillInMonth(bill, year, monthIndex).forEach((iso) => {
    occurrences.add(normalizeISO(iso));
  });

  const dueISO = normalizeISO(bill.dueDate);
  if (isSameMonthISO(dueISO, year, monthIndex)) {
    occurrences.add(dueISO);
  }

  return Array.from(occurrences).map((occurrenceISO) =>
    buildSummary(bill, occurrenceISO, referenceDate),
  );
}

export function collectBillOccurrencesUpToMonth(
  bill: Types.Bill,
  year: number,
  monthIndex: number,
  referenceDate: Date = new Date(),
): BillOccurrenceSummary[] {
  const results: BillOccurrenceSummary[] = [];
  const baseDate = parseDate(bill.dueDate);
  const startKey = makeMonthKey(baseDate);
  const targetKey = year * 12 + monthIndex;
  if (startKey > targetKey) return results;

  for (let key = startKey; key <= targetKey; key += 1) {
    const iterYear = Math.floor(key / 12);
    const iterMonth = key % 12;
    const monthly = collectBillOccurrencesForMonth(bill, iterYear, iterMonth, referenceDate);
    results.push(...monthly);
  }

  return results;
}