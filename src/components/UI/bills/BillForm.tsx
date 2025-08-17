import React, { useState } from "react"
import { uid, fmtMoney, ymd } from '../../../utils/utils.ts'
import Input from '../Input.tsx'
import Select from '../Select.tsx'
import Textarea from '../Textarea.tsx'

// Formulário de criação/edição de contas
export default function BillForm({ initial, onSave, onCancel, t, locale, currency }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || ymd(new Date()));
  const [recurrence, setRecurrence] = useState(initial?.recurrence || "NONE");
  const [category, setCategory] = useState(initial?.category || "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-xl shadow-xl">
        <div className="text-lg font-semibold mb-4">{initial ? t.edit : t.new_bill}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label={`Valor (ex.: ${fmtMoney(4500, currency, locale)})`} type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Vencimento" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Select label="Recorrência" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            <option value="NONE">Sem recorrência</option>
            <option value="MONTHLY">Mensal</option>
            <option value="WEEKLY">Semanal</option>
            <option value="YEARLY">Anual</option>
          </Select>
          <Input label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input label="Tags (separadas por vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <Textarea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800">{t.cancel}</button>
          <button
            onClick={() => {
              if (!title.trim()) return alert("Informe um título");
              if (!dueDate) return alert("Informe o vencimento");
              const bill = {
                id: initial?.id || uid(),
                title: title.trim(),
                amount: Number(amount || 0),
                dueDate: dueDate,
                recurrence,
                category: category.trim() || undefined,
                tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
                notes: notes.trim() || undefined,
                paid: initial?.paid || false,
                paidOn: initial?.paidOn || undefined,
              };
              onSave(bill);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >{t.save}</button>
        </div>
      </div>
    </div>
  );
}