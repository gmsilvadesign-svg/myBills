import { useMemo } from "react";
import { parseDate, isBefore, isSameDayISO, ymd } from '../utils/utils';

export default function useFilteredBills(bills, filter, search) {
  const todayISO = ymd(new Date());

  return useMemo(() => {
    return bills
      .slice()
      .sort((a, b) => parseDate(a.dueDate) - parseDate(b.dueDate))
      .filter(bill => {
        const matchesSearch = [bill.title, bill.category, (bill.tags||[]).join(","), bill.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        if (!matchesSearch) return false;

        const due = parseDate(bill.dueDate);
        const diffDays = Math.floor((due - new Date()) / 86400000);

        switch (filter) {
          case "today": return isSameDayISO(bill.dueDate, todayISO);
          case "overdue": return !bill.paid && isBefore(bill.dueDate, todayISO);
          case "next7": return !bill.paid && diffDays >= 0 && diffDays <= 7;
          case "next30": return !bill.paid && diffDays >= 0 && diffDays <= 30;
          default: return true;
        }
      });
  }, [bills, filter, search, todayISO]);
}