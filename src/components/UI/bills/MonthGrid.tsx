import { memo } from 'react'
import * as Types from '@/types'
import { fmtMoney, fmtMoneyTruncated, ymd, parseDate, isBefore, daysInMonth, occurrencesForBillInMonth } from '@/utils/utils'
import { categoryClass } from '@/constants/categoryColors'

interface MonthGridProps {
  date: Date;
  bills: Types.Bill[];
  purchases?: Types.Purchase[];
  locale: string;
  currency: string;
  onDayClick?: (iso: string) => void;
  hideValues?: boolean;
}

type BillWithOverdue = Types.Bill & { overdue?: boolean };

const MonthGrid = memo(function MonthGrid({ date, bills, purchases = [], locale, currency, onDayClick, hideValues = false }: MonthGridProps) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = ymd(new Date());
  const totalDays = daysInMonth(year, month);

  const itemsByDay = new Map<number, BillWithOverdue[]>();
  const totalsByDay = new Map<number, number>();
  const openByDay = new Map<number, number>();
  const overdueByDay = new Map<number, number>();
  const paidByDay = new Map<number, number>();

  bills.forEach((b) => {
    const occurrences = occurrencesForBillInMonth(b, year, month);
    occurrences.forEach((iso) => {
      const d = parseDate(iso);
      const dayOfMonth = d.getDate();
      const isOverdue = !b.paid && isBefore(iso, today);
      const billForDay: BillWithOverdue = { ...b, dueDate: iso, overdue: isOverdue };
      const arr = itemsByDay.get(dayOfMonth) || [];
      arr.push(billForDay);
      itemsByDay.set(dayOfMonth, arr);

      const amount = Number(b.amount) || 0;
      totalsByDay.set(dayOfMonth, (totalsByDay.get(dayOfMonth) || 0) + amount);
      
      if (b.paid) {
        // Se está paga, adiciona ao total de pagas
        paidByDay.set(dayOfMonth, (paidByDay.get(dayOfMonth) || 0) + amount);
      } else if (isOverdue) {
        // Se não está paga e está atrasada
        overdueByDay.set(dayOfMonth, (overdueByDay.get(dayOfMonth) || 0) + amount);
      } else {
        // Se não está paga e não está atrasada (pendente)
        openByDay.set(dayOfMonth, (openByDay.get(dayOfMonth) || 0) + amount);
      }
    });
  });

  const purchasesSumByDay = new Map<number, number>();
  purchases.forEach((p) => {
    const d = parseDate(p.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const dayOfMonth = d.getDate();
    purchasesSumByDay.set(dayOfMonth, (purchasesSumByDay.get(dayOfMonth) || 0) + (Number(p.amount) || 0));
  });
  for (const [day, sum] of purchasesSumByDay.entries()) {
    totalsByDay.set(day, (totalsByDay.get(day) || 0) + sum);
  }

  const days = Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1));
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => (<div key={`empty-${i}`} className="p-2"></div>));

  return (
    <div className="grid grid-cols-7 gap-1 text-sm overflow-x-auto min-w-full min-h-[400px]">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
        <div key={day} className="p-2 text-center font-medium text-slate-500 dark:text-slate-400">{day}</div>
      ))}

      {emptyCells}

      {days.map((d) => {
        const dayISO = ymd(d);
        const isToday = dayISO === today;
        const hasItems = itemsByDay.has(d.getDate());
        const openSum = openByDay.get(d.getDate()) || 0;
        const overdueSum = overdueByDay.get(d.getDate()) || 0;
        const paidSum = paidByDay.get(d.getDate()) || 0;
        const purchasesSum = purchasesSumByDay.get(d.getDate()) || 0;

        return (
          <div
            key={dayISO}
            onClick={() => onDayClick?.(dayISO)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDayClick?.(dayISO); } }}
            role="button"
            tabIndex={0}
            className={`p-1 md:p-2 h-[92px] md:h-[110px] border rounded-lg flex flex-col min-w-[120px] cursor-pointer ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'} ${hasItems ? 'ring-1 ring-slate-300 dark:ring-slate-600' : ''}`}
          >
            <div className={`text-right mb-1 ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>{d.getDate()}</div>

            <div className="grid grid-cols-3 gap-1 mb-1 text-[10px]">
              {openSum > 0 && (
                <div className="px-1 py-0.5 rounded-md text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 text-center overflow-hidden text-ellipsis" title={`Abertas: ${fmtMoney(openSum, currency, locale)}`}>••••</div>
              )}
              {overdueSum > 0 && (
                <div className="px-1 py-0.5 rounded-md text-red-700 dark:text-red-200 bg-red-50 dark:bg-red-900/30 text-center overflow-hidden text-ellipsis" title={`Atrasadas: ${fmtMoney(overdueSum, currency, locale)}`}>••••</div>
              )}
              {paidSum > 0 && (
                <div className="px-1 py-0.5 rounded-md text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-900/30 text-center overflow-hidden text-ellipsis" title={`Pagas: ${fmtMoney(paidSum, currency, locale)}`}>••••</div>
              )}
              {purchasesSum > 0 && (
                <div className="px-1 py-0.5 rounded-md text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30 text-center overflow-hidden text-ellipsis" title={`Compra: ${fmtMoney(purchasesSum, currency, locale)}`}>••••</div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              {(itemsByDay.get(d.getDate()) || []).slice(0, 1).map((it) => (
                <div key={it.id} className={`rounded-md px-2 py-1 text-[11px] whitespace-nowrap overflow-hidden ${categoryClass(it.category || undefined)}`} title={it.title}>
                  <span className="truncate block">{it.title}</span>
                </div>
              ))}
              {(() => {
                const dayItems = itemsByDay.get(d.getDate());
                return dayItems && dayItems.length > 1 && (<div className="text-[11px] text-slate-500">+{dayItems.length - 1} mais…</div>);
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default MonthGrid

