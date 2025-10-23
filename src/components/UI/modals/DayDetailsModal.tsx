import { useEffect, memo } from 'react'
import * as Types from '@/types'
import { ymd, parseDate, formatDate, isBefore, occurrencesForBillInMonth } from '@/utils/utils'
import Pill from '@/components/UI/Pill'

interface DayDetailsModalProps {
  open: boolean;
  onClose: () => void;
  dateISO: string;
  bills: Types.Bill[];
  purchases: Types.Purchase[];
  t: Record<string, any>;
  locale: string;
  currency: string;
  hideValues?: boolean;
}

function money(v: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v)
}

const DayDetailsModal = memo(function DayDetailsModal({ open, onClose, dateISO, bills, purchases, t, locale, currency, hideValues = false }: DayDetailsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const d = parseDate(dateISO);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();

  // Filtro de contas que ocorrem neste dia (considera recorrência)
  const dayBills = bills.filter((b) => {
    try {
      return occurrencesForBillInMonth(b, y, m).includes(dateISO);
    } catch {
      // fallback para itens sem recorrência
      const bd = parseDate(b.dueDate);
      return bd.getFullYear() === y && bd.getMonth() === m && bd.getDate() === day;
    }
  });

  // Contas deste dia
  const allDayBills = dayBills;

  // Compras deste dia
  const dayPurchases = purchases.filter((p) => {
    const pd = parseDate(p.date);
    return pd.getFullYear() === y && pd.getMonth() === m && pd.getDate() === day;
  });

  const todayISO = ymd(new Date());
  const openSum = allDayBills.filter(b => !b.paid && !isBefore(b.dueDate, todayISO)).reduce((s, b) => s + Number(b.amount || 0), 0);
  const overdueSum = allDayBills.filter(b => !b.paid && isBefore(b.dueDate, todayISO)).reduce((s, b) => s + Number(b.amount || 0), 0);
  const paidSum = allDayBills.filter(b => b.paid).reduce((s, b) => s + Number(b.amount || 0), 0);
  const purchasesSum = dayPurchases.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[75vh] flex flex-col m-4">
        <div className="flex items-center justify-between mb-4 flex-shrink-0 p-6 pb-0">
          <h2 className="text-xl font-semibold">{t.view_calendar || 'Calendário'} — {formatDate(dateISO, locale)}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-100">{t.close || 'Fechar'}</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-6">
          {/* Totais do dia */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
            <div className="rounded-xl p-2 bg-amber-50 text-amber-700 text-center">
              <div className="text-xs">{t.totals_open || 'Abertas'}</div>
              <div className="text-base font-semibold overflow-hidden text-ellipsis" title={money(openSum, currency, locale)}>{hideValues ? '••••••' : money(openSum, currency, locale)}</div>
            </div>
            <div className="rounded-xl p-2 bg-red-50 text-red-700 text-center">
              <div className="text-xs">{t.filter_overdue || 'Atrasadas'}</div>
              <div className="text-base font-semibold overflow-hidden text-ellipsis" title={money(overdueSum, currency, locale)}>{hideValues ? '••••••' : money(overdueSum, currency, locale)}</div>
            </div>
            <div className="rounded-xl p-2 bg-green-50 text-green-700 text-center">
              <div className="text-xs">{t.totals_paid || 'Pagas'}</div>
              <div className="text-base font-semibold overflow-hidden text-ellipsis" title={money(paidSum, currency, locale)}>{hideValues ? '••••••' : money(paidSum, currency, locale)}</div>
            </div>
            <div className="rounded-xl p-2 bg-blue-50 text-blue-700 text-center">
              <div className="text-xs">{t.purchases || 'Compras'}</div>
              <div className="text-base font-semibold overflow-hidden text-ellipsis" title={money(purchasesSum, currency, locale)}>{hideValues ? '••••••' : money(purchasesSum, currency, locale)}</div>
            </div>
          </div>

          {/* Lista de contas (padrão semelhante ao menu Contas) */}
          <div className="mb-3">
            <h3 className="text-base font-medium mb-2">{t.section_bills || 'Contas'}</h3>
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 overflow-hidden">
              {allDayBills.length === 0 && (
                <div className="py-6 text-center text-slate-600">{t.no_bills || 'Sem contas neste dia.'}</div>
              )}
              {allDayBills.map((b) => {
                const overdue = !b.paid && isBefore(b.dueDate, todayISO);
                return (
                  <div key={b.id || b.title + b.dueDate} className="py-3 px-4 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {b.paid ? (
                        <Pill tone="green">{t.paid}</Pill>
                      ) : overdue ? (
                        <Pill tone="red">{t.overdue}</Pill>
                      ) : (
                        <Pill tone="amber">{t.pending}</Pill>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate" title={b.title}>{b.title}</div>
                      <div className="text-xs text-slate-600">{b.category || ''}</div>
                    </div>
                    <div className="text-right font-semibold min-w-[120px] overflow-hidden text-ellipsis" title={money(Number(b.amount || 0), currency, locale)}>{hideValues ? '••••••' : money(Number(b.amount || 0), currency, locale)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de compras do dia (se houver) */}
          {dayPurchases.length > 0 && (
            <div className="mb-3">
              <h3 className="text-base font-medium mb-2">{t.purchases || 'Compras'}</h3>
              <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 overflow-hidden">
                {dayPurchases.map((p) => (
                  <div key={p.id || p.title + p.date} className="py-3 px-4 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate" title={p.title}>{p.title}</div>
                      <div className="text-xs text-slate-600">{p.category || ''}</div>
                    </div>
                    <div className="text-right font-semibold min-w-[120px] overflow-hidden text-ellipsis" title={money(Number(p.amount || 0), currency, locale)}>{hideValues ? '••••••' : money(Number(p.amount || 0), currency, locale)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default DayDetailsModal


