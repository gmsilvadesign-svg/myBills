import { memo } from 'react';
import * as Types from '@/types';
import { fmtMoney, ymd, parseDate, isBefore, daysInMonth, occurrencesForBillInMonth } from '@/utils/utils';
import { categoryClass } from '@/constants/categoryColors';
import { cn } from '@/styles/constants';

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

const MonthGrid = memo(function MonthGrid({
  date,
  bills,
  purchases = [],
  locale,
  currency,
  onDayClick,
  hideValues = false,
}: MonthGridProps) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = ymd(new Date());
  const totalDays = daysInMonth(year, month);

  const formatCurrency = (value: number) => (hideValues ? '*****' : fmtMoney(value, currency, locale));
  const valueTitle = (label: string, value: number) =>
    `${label}: ${hideValues ? 'Valor oculto' : fmtMoney(value, currency, locale)}`;

  const itemsByDay = new Map<number, BillWithOverdue[]>();
  const openByDay = new Map<number, number>();
  const overdueByDay = new Map<number, number>();
  const paidByDay = new Map<number, number>();

  bills.forEach((bill) => {
    const occurrences = occurrencesForBillInMonth(bill, year, month);
    occurrences.forEach((iso) => {
      const dayDate = parseDate(iso);
      const day = dayDate.getDate();
      const isOverdue = !bill.paid && isBefore(iso, today);

      const bucket = itemsByDay.get(day) ?? [];
      bucket.push({ ...bill, dueDate: iso, overdue: isOverdue });
      itemsByDay.set(day, bucket);

      const amount = Number(bill.amount) || 0;
      if (bill.paid) {
        paidByDay.set(day, (paidByDay.get(day) || 0) + amount);
      } else if (isOverdue) {
        overdueByDay.set(day, (overdueByDay.get(day) || 0) + amount);
      } else {
        openByDay.set(day, (openByDay.get(day) || 0) + amount);
      }
    });
  });

  const purchasesByDay = new Map<number, number>();
  purchases.forEach((purchase) => {
    const dayDate = parseDate(purchase.date);
    if (dayDate.getFullYear() !== year || dayDate.getMonth() !== month) return;
    const day = dayDate.getDate();
    purchasesByDay.set(day, (purchasesByDay.get(day) || 0) + Number(purchase.amount || 0));
  });

  const days = Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1));
  const firstWeekday = new Date(year, month, 1).getDay();
  const emptyCells = Array.from({ length: firstWeekday }, (_, idx) => (
    <div key={`empty-${idx}`} className="p-2" />
  ));

  return (
    <div className="grid grid-cols-7 gap-1 text-sm overflow-x-auto min-w-full min-h-[400px]">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((weekday) => (
        <div key={weekday} className="p-2 text-center font-medium text-slate-600">
          {weekday}
        </div>
      ))}

      {emptyCells}

      {days.map((dayDate) => {
        const day = dayDate.getDate();
        const iso = ymd(dayDate);
        const isToday = iso === today;
        const bucket = itemsByDay.get(day) ?? [];

        const openSum = openByDay.get(day) || 0;
        const overdueSum = overdueByDay.get(day) || 0;
        const paidSum = paidByDay.get(day) || 0;
        const purchasesSum = purchasesByDay.get(day) || 0;

        const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onDayClick?.(iso);
          }
        };

        return (
          <div
            key={iso}
            onClick={() => onDayClick?.(iso)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className={cn(
              'p-1 md:p-2 h-[92px] md:h-[110px] border rounded-lg flex flex-col min-w-[120px] cursor-pointer transition-colors',
              isToday ? 'bg-blue-50 border-blue-200 shadow-inner' : 'bg-white border-slate-200',
              bucket.length ? 'ring-1 ring-slate-200' : '',
            )}
          >
            <div className={cn('text-right mb-1', isToday ? 'font-semibold text-blue-600' : 'text-slate-600')}>
              {dayDate.getDate()}
            </div>

            <div className="grid grid-cols-3 gap-1 mb-1 text-[10px]">
              {openSum > 0 && (
                <div
                  className="px-1 py-0.5 rounded-md text-amber-700 bg-amber-50 text-center overflow-hidden text-ellipsis"
                  title={valueTitle('Abertas', openSum)}
                >
                  {formatCurrency(openSum)}
                </div>
              )}
              {overdueSum > 0 && (
                <div
                  className="px-1 py-0.5 rounded-md text-rose-700 bg-rose-50 text-center overflow-hidden text-ellipsis"
                  title={valueTitle('Atrasadas', overdueSum)}
                >
                  {formatCurrency(overdueSum)}
                </div>
              )}
              {paidSum > 0 && (
                <div
                  className="px-1 py-0.5 rounded-md text-emerald-700 bg-emerald-50 text-center overflow-hidden text-ellipsis"
                  title={valueTitle('Pagas', paidSum)}
                >
                  {formatCurrency(paidSum)}
                </div>
              )}
              {purchasesSum > 0 && (
                <div
                  className="px-1 py-0.5 rounded-md text-sky-700 bg-sky-50 text-center overflow-hidden text-ellipsis"
                  title={valueTitle('Compras', purchasesSum)}
                >
                  {formatCurrency(purchasesSum)}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1 overflow-hidden">
              {bucket.slice(0, 1).map((item) => (
                <div
                  key={item.id}
                  className={cn('rounded-md px-2 py-1 text-[11px] whitespace-nowrap overflow-hidden', categoryClass(item.category || undefined))}
                  title={item.title}
                >
                  <span className="truncate block">{item.title}</span>
                </div>
              ))}
              {bucket.length > 1 && (
                <div className="text-[11px] text-slate-600">+{bucket.length - 1} mais…</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default MonthGrid;
