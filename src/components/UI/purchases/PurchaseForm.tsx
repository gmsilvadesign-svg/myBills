// React
import { useState, useRef, useCallback } from 'react';

// Components
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Textarea from '@/components/UI/Textarea';

// Utils
import { ymd } from '@/utils/utils';

// Types
import * as Types from '@/types';
import { TranslationDictionary } from '@/constants/translation';

interface PurchaseFormProps {
  initial?: Partial<Types.Purchase>;
  onSave: (purchase: Omit<Types.Purchase, 'id'>) => void;
  onCancel: () => void;
  t: TranslationDictionary;
}

export default function PurchaseForm({ initial, onSave, onCancel, t }: PurchaseFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState<number | string>(initial?.amount ?? '');
  const [date, setDate] = useState(initial?.date || ymd(new Date()));
  const [category, setCategory] = useState(initial?.category || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  const titleRef = useRef<HTMLInputElement>(null);

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
    if (!title.trim()) { alert('Informe um título'); titleRef.current?.focus(); return; }
    if (!amount || Number(amount) <= 0) { alert('Informe um valor válido'); return; }
    const purchase: Omit<Types.Purchase, 'id'> = {
      title: title.trim(),
      amount: Number(amount),
      date,
      category: category || null,
      notes: notes.trim() || null,
    };
    onSave(purchase);
    onCancel();
  }, [title, amount, date, category, notes, onSave, onCancel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white text-slate-900 rounded-2xl p-6 w-full max-w-3xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-6">{t.new_purchase || '+ Compra'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input label={t.title || 'Título'} value={title} onChange={e => setTitle(e.target.value)} autoFocus ref={titleRef as any} maxLength={20} />
            <div className="relative">
              <Input label={t.amount || 'Valor'} type="number" min="0" step="0.01" value={amount} onChange={handleAmountChange} required className="pr-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input label={t.date || 'Data'} type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Select label={t.category || 'Categoria'} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">{t.select_category || 'Selecione uma categoria'}</option>
              <option value="Mercado">Mercado</option>
              <option value="Restaurante">Restaurante</option>
              <option value="Transporte">Transporte</option>
              <option value="Outros">Outros</option>
            </Select>
          </div>
          <Textarea label={t.notes || 'Notas'} value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
            <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 text-slate-700">{t.cancel}</button>
            <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


