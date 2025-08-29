import { memo } from 'react'
import * as Types from '@/types';
import { fmtMoney, ymd, parseDate, isBefore, daysInMonth, occurrencesForBillInMonth } from '@/utils/utils'

// Interface para as props do componente
interface MonthGridProps {
  date: Date;
  bills: Types.Bill[];
  purchases?: Types.Purchase[];
  locale: string;
  currency: string;
}

// Tipo estendido de Bill com propriedade overdue
type BillWithOverdue = Types.Bill & {
  overdue?: boolean;
};

// Componente que renderiza um calendário mensal com contas
const MonthGrid = memo(function MonthGrid({ date, bills, purchases = [], locale, currency }: MonthGridProps) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = ymd(new Date());
  const totalDays = daysInMonth(year, month);

  // Mapas para agrupar contas por dia
  const itemsByDay = new Map<number, BillWithOverdue[]>();
  const totalsByDay = new Map<number, number>();

  // Processa todas as contas para o mês atual
  bills.forEach((b) => {
    if (b.paid) return; // Ignora contas já pagas

    // Gera todas as ocorrências da conta no mês
    const occurrences = occurrencesForBillInMonth(b, year, month);

    occurrences.forEach((iso) => {
      const d = parseDate(iso);
      const dayOfMonth = d.getDate();

      // Cria uma versão da conta com informações específicas da ocorrência
      const billForDay: BillWithOverdue = {
        ...b,
        dueDate: iso,
        overdue: isBefore(iso, today), // Marca se está atrasada
      };

      // Adiciona ao mapa de itens por dia
      const arr = itemsByDay.get(dayOfMonth) || [];
      arr.push(billForDay);
      itemsByDay.set(dayOfMonth, arr);

      // Adiciona ao total do dia
      totalsByDay.set(dayOfMonth, (totalsByDay.get(dayOfMonth) || 0) + (Number(b.amount) || 0));
    });
  });

  // Agrega compras por dia (consolidadas)
  const purchasesSumByDay = new Map<number, number>();
  purchases.forEach((p) => {
    const d = parseDate(p.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const dayOfMonth = d.getDate();
    purchasesSumByDay.set(dayOfMonth, (purchasesSumByDay.get(dayOfMonth) || 0) + (Number(p.amount) || 0));
  });
  // Soma compras ao total do dia
  for (const [day, sum] of purchasesSumByDay.entries()) {
    totalsByDay.set(day, (totalsByDay.get(day) || 0) + sum);
  }

  // Gera array de dias do mês
  const days = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    return new Date(year, month, dayNum);
  });

  // Calcula o primeiro dia da semana (0=domingo, 1=segunda, etc.)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Gera células vazias para os dias antes do primeiro dia do mês
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => (
    <div key={`empty-${i}`} className="p-2"></div>
  ));

  return (
    <div className="grid grid-cols-7 gap-1 text-sm overflow-x-auto min-w-full min-h-[400px]">
      {/* Cabeçalho dos dias da semana */}
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
        <div key={day} className="p-2 text-center font-medium text-slate-500 dark:text-slate-400">
          {day}
        </div>
      ))}

      {/* Células vazias antes do primeiro dia */}
      {emptyCells}

      {/* Dias do mês */}
      {days.map((d) => {
        const dayISO = ymd(d);
        const isToday = dayISO === today;
        const hasItems = itemsByDay.has(d.getDate());
        const dayTotal = totalsByDay.get(d.getDate());

        return (
          <div
            key={dayISO}
            className={`p-1 md:p-2 h-[80px] md:h-[100px] border rounded-lg flex flex-col min-w-[120px] ${
              isToday
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
            } ${hasItems ? 'ring-1 ring-slate-300 dark:ring-slate-600' : ''}`}
          >
            {/* Número do dia */}
            <div className={`text-right mb-1 ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
              {d.getDate()}
            </div>

            {/* Total do dia */}
            <div className="text-right text-xs text-slate-500 dark:text-slate-400 mb-2">
              {dayTotal ? fmtMoney(dayTotal, currency, locale) : ""}
            </div>

            {/* Lista de contas do dia */}
            <div className="flex-1 space-y-1 ">
              {(() => { const sum = (purchasesSumByDay.get(d.getDate()) || 0); return sum ? (
                <div className="rounded-lg px-2 py-1 text-xs flex items-center justify-between whitespace-nowrap bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200">
                  <span className="flex-shrink-0" title="Compras">Compras</span>
                  <span className="font-medium text-right flex-shrink-0 ml-2">{fmtMoney(sum, currency, locale)}</span>
                </div>
              ) : null; })()}
              {(itemsByDay.get(d.getDate()) || []).slice(0, 3).map((it) => (
                <div 
                  key={it.id} 
                  className={`rounded-lg px-2 py-1 text-xs flex items-center justify-between whitespace-nowrap ${it.overdue ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
                >
                  <span className="flex-shrink-0" title={it.title}>{it.title}</span>
                  <span className="font-medium text-right flex-shrink-0 ml-2">{fmtMoney(it.amount, currency, locale)}</span>
                </div>
              ))}

              {/* Indica se há mais de 3 contas no dia */}
              {(() => {
                const dayItems = itemsByDay.get(d.getDate());
                return dayItems && dayItems.length > 3 && (
                  <div className="text-[11px] text-slate-500">+{dayItems.length - 3} mais…</div>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default MonthGrid;
