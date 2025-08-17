import { useMemo } from "react";
import { parseDate } from '../utils/utils';

export default function useTotals(bills) {
  return useMemo(() => {
    const sum = arr => arr.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

    const dueAll = bills.filter(b => !b.paid);
    const now = new Date();
    const dueMonth = bills.filter(b => {
      const d = parseDate(b.dueDate);
      return !b.paid && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    return {
      allOpen: sum(dueAll),
      monthOpen: sum(dueMonth),
      countOpen: dueAll.length,
    };
  }, [bills]);
}