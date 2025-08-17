import Pill from '../Pill.tsx';
import { fmtMoney, formatDate, isBefore, ymd } from '../../../utils/utils.ts';

export default function BillRow({ bill, markPaid, setEditing, setConfirm, t, locale, currency }) {
  const overdue = !bill.paid && isBefore(bill.dueDate, ymd(new Date()));

  return (
    <div className="py-3 flex items-center gap-3">
      <div className="flex-1">
        <div className="font-medium flex items-center gap-2">
          <span>{bill.title}</span>
          {bill.category && <Pill>{bill.category}</Pill>}
          {bill.recurrence && bill.recurrence!=="NONE" && <Pill tone="green">{bill.recurrence.toLowerCase()}</Pill>}
        </div>
        <div className="text-sm text-slate-500">
          {t.due_on} {formatDate(bill.dueDate, locale)}
          {bill.tags?.length ? ` · ${bill.tags.join(", ")}` : ""}
          {bill.paid && bill.paidOn ? ` · ${t.paid_on} ${formatDate(bill.paidOn, locale)}` : ""}
        </div>
      </div>

      <div className="w-36 text-right font-semibold">{fmtMoney(bill.amount, currency, locale)}</div>
      <div className="w-40 text-right">
        {!bill.paid && overdue && <Pill tone="red">{t.overdue}</Pill>}
        {!bill.paid && !overdue && <Pill tone="amber">{t.pending}</Pill>}
        {bill.paid && <Pill tone="green">{t.paid}</Pill>}
      </div>

      <div className="flex gap-2">
        {!bill.paid && <>
          <button onClick={()=>markPaid(bill.id,false)} className="px-3 py-1 rounded-xl bg-emerald-600 text-white">{t.mark_paid}</button>
          {bill.recurrence && bill.recurrence!=="NONE" &&
            <button onClick={()=>markPaid(bill.id,true)} className="px-3 py-1 rounded-xl bg-indigo-600 text-white">{t.pay_and_advance}</button>
          }
        </>}
        <button onClick={()=>setEditing(bill)} className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800">{t.edit}</button>
        <button onClick={()=>setConfirm({open:true,id:bill.id})} className="px-3 py-1 rounded-xl bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">{t.delete}</button>
      </div>
    </div>
  )
}