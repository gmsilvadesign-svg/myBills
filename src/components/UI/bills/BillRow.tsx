// Importa componente Pill, usado para exibir categorias, status e recorrência em pequenas tags
import Pill from '../Pill.tsx'

// Importa utilitários: fmtMoney (formata valores monetários), formatDate (formata datas), isBefore (compara datas), ymd (formata data para yyyy-mm-dd)
import { fmtMoney, formatDate, isBefore, ymd } from '../../../utils/utils.ts'

// Componente BillRow: exibe uma linha na lista de contas
export default function BillRow({ bill, markPaid, setEditing, setConfirm, t, locale, currency }) {

  // Verifica se a conta está vencida (não paga e com data anterior a hoje)
  const overdue = !bill.paid && isBefore(bill.dueDate, ymd(new Date()))

  // JSX da linha da conta
  return (
    // Container principal da linha, com padding vertical e espaçamento entre elementos
    <div className="py-3 flex items-center gap-3">

      {/* Container principal do título, categoria e recorrência */}
      <div className="flex-1">

        {/* Título da conta com categorias e recorrência */}
        <div className="font-medium flex items-center gap-2">
          {/* Nome da conta */}
          <span>{bill.title}</span>

          {/* Categoria da conta, se existir */}
          {bill.category && <Pill>{bill.category}</Pill>}

          {/* Recorrência da conta, se existir e não for NONE */}
          {bill.recurrence && bill.recurrence !== "NONE" && <Pill tone="green">{t[bill.recurrence.toLowerCase()]}</Pill>}
        </div>

        {/* Informações adicionais da conta: vencimento, tags e data de pagamento */}
        <div className="text-sm text-slate-500">
          {t.due_on} {formatDate(bill.dueDate, locale)}
          {bill.tags?.length ? ` · ${bill.tags.join(", ")}` : ""}
          {bill.paid && bill.paidOn ? ` · ${t.paid_on} ${formatDate(bill.paidOn, locale)}` : ""}
        </div>

      </div>

      {/* Valor da conta, alinhado à direita */}
      <div className="w-36 text-right font-semibold">{fmtMoney(bill.amount, currency, locale)}</div>

      {/* Status da conta (vencida, pendente, paga) */}
      <div className="w-40 text-right">
        {!bill.paid && overdue && <Pill tone="red">{t.overdue}</Pill>}
        {!bill.paid && !overdue && <Pill tone="amber">{t.pending}</Pill>}
        {bill.paid && <Pill tone="green">{t.paid}</Pill>}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        {/* Botões apenas para contas não pagas */}
        {!bill.paid && <>
          {/* Marca como paga, sem avançar a recorrência */}
          <button onClick={() => markPaid(bill, false)} className="px-3 py-1 rounded-xl bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">{t.mark_paid}</button>

          {/* Marca como paga e avança a recorrência, se houver */}
          {bill.recurrence && bill.recurrence !== "NONE" &&
            <button onClick={() => markPaid(bill, true)}>{t.pay_and_advance}</button>
          }
        </>}

        {/* Botão para editar a conta */}
        <button onClick={() => setEditing(bill)} className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800">{t.edit}</button>

        {/* Botão para deletar a conta (abre modal de confirmação) */}
        <button onClick={() => setConfirm({ open: true, id: bill.id })} className="px-3 py-1 rounded-xl bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">{t.delete}</button>
      </div>

    </div>
  )
}
