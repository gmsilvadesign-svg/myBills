import { useMemo } from "react";

import * as Types from "@/types";
import { occurrencesForBillInMonth, parseDate } from "@/utils/utils";

export interface MonthlyMetrics {
  incomePlanned: number;
  billsPlanned: number;
  purchasesPlanned: number;
  savingsPlanned: number;
}

export interface UseMonthlyMetricsParams {
  bills: Types.Bill[];
  incomes: Types.Income[];
  purchases: Types.Purchase[];
  referenceDate?: Date;
}

const countOccurrencesForSchedule = (
  dueDate: string,
  recurrence: Types.Bill['recurrence'],
  year: number,
  month: number,
): number => {
  const stub: Types.Bill = {
    id: 'schedule',
    title: '',
    amount: 0,
    dueDate,
    recurrence,
    paid: false,
    paidOn: null,
  };
  return occurrencesForBillInMonth(stub, year, month).length;
};

export function useMonthlyMetrics({ bills, incomes, purchases, referenceDate = new Date() }: UseMonthlyMetricsParams): MonthlyMetrics {
  return useMemo(() => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    const incomePlanned = incomes.reduce((sum, income) => {
      const occurrences = countOccurrencesForSchedule(income.dueDate, income.recurrence, year, month);
      if (occurrences > 0) {
        return sum + occurrences * Number(income.amount || 0);
      }
      return sum;
    }, 0);

    const billsPlanned = bills.reduce((sum, bill) => {
      const occurrences = countOccurrencesForSchedule(bill.dueDate, bill.recurrence, year, month);
      if (occurrences > 0) {
        return sum + occurrences * Number(bill.amount || 0);
      }
      return sum;
    }, 0);

    const purchasesPlanned = purchases.reduce((sum, purchase) => {
      const date = parseDate(purchase.date);
      if (date.getFullYear() === year && date.getMonth() === month) {
        return sum + Number(purchase.amount || 0);
      }
      return sum;
    }, 0);

    const savingsPlanned = incomePlanned - (billsPlanned + purchasesPlanned);

    return {
      incomePlanned,
      billsPlanned,
      purchasesPlanned,
      savingsPlanned,
    };
  }, [bills, incomes, purchases, referenceDate]);
}

export interface GoalSummary {
  key: string;
  label: string;
  current: number;
  target?: number | null;
  variant: 'target' | 'limit';
  progress?: number | null;
}

export interface UseGoalSummariesParams {
  goals?: Types.UserGoals;
  metrics: MonthlyMetrics;
}

export function useGoalSummaries({ goals, metrics }: UseGoalSummariesParams): GoalSummary[] {
  return useMemo(() => {
    if (!goals) return [];

    const summaries: GoalSummary[] = [];

    const buildProgress = (current: number, target?: number | null): number | null => {
      if (typeof target !== 'number' || !Number.isFinite(target) || target === 0) return null;
      return current / target;
    };

    summaries.push({
      key: 'income',
      label: 'Meta de renda',
      current: metrics.incomePlanned,
      target: goals.incomeTarget ?? null,
      variant: 'target',
      progress: buildProgress(metrics.incomePlanned, goals.incomeTarget ?? null),
    });

    summaries.push({
      key: 'savings',
      label: 'Meta de economia',
      current: metrics.savingsPlanned,
      target: goals.savingsTarget ?? null,
      variant: 'target',
      progress: buildProgress(metrics.savingsPlanned, goals.savingsTarget ?? null),
    });

    summaries.push({
      key: 'bills-limit',
      label: 'Teto de gastos em contas',
      current: metrics.billsPlanned,
      target: goals.expensesLimit ?? null,
      variant: 'limit',
      progress: buildProgress(metrics.billsPlanned, goals.expensesLimit ?? null),
    });

    summaries.push({
      key: 'purchases-limit',
      label: 'Teto de compras',
      current: metrics.purchasesPlanned,
      target: goals.purchasesLimit ?? null,
      variant: 'limit',
      progress: buildProgress(metrics.purchasesPlanned, goals.purchasesLimit ?? null),
    });

    return summaries;
  }, [goals, metrics]);
}
