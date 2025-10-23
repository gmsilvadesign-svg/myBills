import { useState, useMemo } from 'react';
import Section from '@/components/layout/Section';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import Select from '@/components/UI/Select';
import { ymd } from '@/utils/utils';
import * as Types from '@/types';
import { TranslationDictionary } from '@/constants/translation';

interface PurchasesViewProps {
  purchases: Types.Purchase[];
  onSave: (purchase: Omit<Types.Purchase, 'id'>) => void;
  onRemove: (id: string) => void;
  t: TranslationDictionary;
  locale: string;
  currency: string;
}

export default function PurchasesView({ purchases, onSave, onRemove, t, locale, currency }: PurchasesViewProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string | number>('');
  const [date, setDate] = useState(ymd(new Date()));
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const monthPurchases = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return purchases.filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [purchases]);

  const total = monthPurchases.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <Section title={t.purchases || 'Compras'}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) { alert('Informe um título'); return; }
          if (!amount || Number(amount) <= 0) { alert('Informe um valor válido'); return; }
          onSave({ title: title.trim(), amount: Number(amount), date, category: category || null, notes: notes.trim() || null });
          setTitle(''); setAmount(''); setNotes('');
        }}
        className="rounded-2xl border border-slate-200 p-4 bg-white mb-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Input label={t.title || 'Título'} value={title} onChange={e => setTitle(e.target.value)} />
          <Input label={t.amount || 'Valor'} type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          <Input label={t.date || 'Data'} type="date" value={date} onChange={e => setDate(e.target.value)} />
          <Select label={t.category || 'Categoria'} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">{t.select_category || 'Selecione uma categoria'}</option>
            <option value="Mercado">Mercado</option>
            <option value="Restaurante">Restaurante</option>
            <option value="Transporte">Transporte</option>
            <option value="Outros">Outros</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 mt-3">
          <Textarea label={t.notes || 'Notas'} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white">{t.save}</button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{t.monthly_purchases || 'Compras do mês'}</h3>
          <div className="text-sm">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(total)}</div>
        </div>
        {monthPurchases.length === 0 && (
          <div className="text-slate-600 text-center py-8">{t.no_purchases || 'Nenhuma compra registrada neste mês.'}</div>
        )}
        {monthPurchases.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {monthPurchases.map(p => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-600">{p.date}{p.category ? ` • ${p.category}` : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(p.amount)}</div>
                  {p.id && (
                    <button onClick={() => onRemove(p.id!)} className="text-red-600 hover:text-red-700 text-sm">{t.delete || 'Excluir'}</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}

