// Importa hook useState para gerenciar estados locais do formulário
import { useState } from "react"

// Importa utilitários: uid (gerador de ID), fmtMoney (formata valores monetários), ymd (formata datas para yyyy-mm-dd)
import { uid, fmtMoney, ymd } from '../../../utils/utils.ts'

// Importa componentes de input personalizados
import Input from '../Input.tsx'
import Select from '../Select.tsx'
import Textarea from '../Textarea.tsx'

// Componente BillForm: formulário para criação ou edição de contas
export default function BillForm({ initial, onSave, onCancel, t, locale, currency }) {

  // Estados locais do formulário, inicializados com valores existentes ou padrões
  const [title, setTitle] = useState(initial?.title || "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || ymd(new Date()));
  const [recurrence, setRecurrence] = useState(initial?.recurrence || "NONE");
  const [category, setCategory] = useState(initial?.category || "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  // JSX do formulário
  return (
    // Overlay escuro cobrindo toda a tela, centraliza o modal
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* Modal do formulário com fundo branco, bordas arredondadas e sombra */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl">

        {/* Título do formulário (novo ou edição) */}
        <div className="text-lg font-semibold mb-4">{initial ? t.edit : t.new_bill}</div>

        {/* Grid para inputs do formulário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input para título */}
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />

          {/* Input para valor, com formatação monetária de exemplo */}
          <Input 
            label={`Valor (ex.: ${fmtMoney(4500, currency, locale)})`} 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
          />

          {/* Input para data de vencimento */}
          <Input label="Vencimento" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          {/* Select para recorrência da conta */}
          <Select label="Recorrência" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            <option value="NONE">Sem recorrência</option>
            <option value="MONTHLY">Mensal</option>
            <option value="WEEKLY">Semanal</option>
            <option value="YEARLY">Anual</option>
          </Select>

          {/* Input para categoria */}
          <Input label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} />

          {/* Input para tags, separadas por vírgula */}
          <Input label="Tags (separadas por vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        {/* Textarea para notas */}
        <Textarea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />

        {/* Botões de ação do formulário */}
        <div className="flex gap-3 justify-end">
          {/* Botão de cancelar */}
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-200"
          >
            {t.cancel}
          </button>

          {/* Botão de salvar */}
          <button
            onClick={() => {
              // Validações simples
              if (!title.trim()) return alert("Informe um título");
              if (!dueDate) return alert("Informe o vencimento");

              // Criação do objeto da conta
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

              // Chama função de salvar passada via props
              onSave(bill);

              // Fecha o modal
              onCancel();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white"
          >
            {t.save}
          </button>
        </div>

      </div>
    </div>
  );
}
