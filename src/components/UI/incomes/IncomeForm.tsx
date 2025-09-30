// React
import { useState, useRef, useCallback } from 'react';

// Utils
import { ymd } from '@/utils/utils';

// Components
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Textarea from '@/components/UI/Textarea';

// Types
import * as Types from '@/types';

interface IncomeFormProps {
  initial?: Partial<Types.Income>;
  onSave: (income: Omit<Types.Income, 'id'>) => void;
  onCancel: () => void;
  t: Record<string, string>;
}

export default function IncomeForm({ initial, onSave, onCancel, t }: IncomeFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState<number | string>(initial?.amount ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || ymd(new Date()));
  const [recurrence, setRecurrence] = useState<'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>(initial?.recurrence || 'NONE');
  const [category, setCategory] = useState(initial?.category || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove caracteres não numéricos exceto ponto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Limita a 12 dígitos (incluindo decimais)
    const digitsOnly = numericValue.replace(/\./g, '');
    if (digitsOnly.length <= 12) {
      setAmount(numericValue);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Informe um título');
      titleInputRef.current?.focus();
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Informe um valor válido');
      return;
    }
    if (!category) {
      alert('Selecione uma categoria');
      return;
    }
    const income: Omit<Types.Income, 'id'> = {
      title: title.trim(),
      amount: Number(amount),
      dueDate,
      recurrence,
      category,
      notes: notes.trim() || null,
    };
    onSave(income);
    onCancel();
  }, [title, amount, dueDate, recurrence, category, notes, onSave, onCancel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 w-full max-w-3xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-6">{t.new_income || '+ Fonte de Renda'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input label="Título" value={title} onChange={e => setTitle(e.target.value)} autoFocus ref={titleInputRef as any} maxLength={20} />
            <div className="relative">
              <Input label="Valor" type="number" min="0" step="0.01" value={amount} onChange={handleAmountChange} required className="pr-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input label="Data" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <Select label="Recorrência" value={recurrence} onChange={e => setRecurrence(e.target.value as any)}>
              <option value="NONE">Única</option>
              <option value="MONTHLY">Mensal</option>
              <option value="WEEKLY">Semanal</option>
              <option value="YEARLY">Anual</option>
              <option value="DAILY">Diária</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Selecione uma categoria</option>
              <option value="Salário">Salário</option>
              <option value="Trabalho extra">Trabalho extra</option>
              <option value="Empresa A">Empresa A</option>
              <option value="Empresa B">Empresa B</option>
              <option value="Décimo 13">Décimo 13</option>
            </Select>
            <Textarea label="Notas" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
            <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {t.cancel}
            </button>
            <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white">
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

