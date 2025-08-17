import { ymd, nextOccurrenceISO } from '../utils/utils';

export default function useBillsActions(setBills) {
  const upsertBill = (bill) => {
    setBills(prev => {
      const idx = prev.findIndex(x => x.id === bill.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = bill;
        return next;
      }
      return [...prev, bill];
    });
  };

  const removeBill = (id) => setBills(prev => prev.filter(b => b.id !== id));

  const markPaid = (id, advance = false) => {
    setBills(prev => prev.map(b => {
      if (b.id !== id) return b;
      if (advance && b.recurrence && b.recurrence !== "NONE") {
        return { ...b, dueDate: nextOccurrenceISO(b.dueDate, b.recurrence), paid: false, paidOn: undefined };
      }
      return { ...b, paid: true, paidOn: ymd(new Date()) };
    }));
  };

  return { upsertBill, removeBill, markPaid };
}