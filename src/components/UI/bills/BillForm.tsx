// React
import { useState, useEffect, useRef, useCallback } from "react";

// Utils
import { fmtMoney, ymd } from '@/utils/utils';

// Components
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Textarea from '@/components/UI/Textarea';

// Types
import * as Types from '@/types';
interface BillFormProps {
  initial?: Partial<Types.Bill>;
  onSave: (bill: Omit<Types.Bill, 'id'>) => void;
  onCancel: () => void;
  t: Record<string, string>; // Traduções
  locale: string;
  currency: string;
}

export default function BillForm({ initial, onSave, onCancel, t, locale, currency }: BillFormProps) {
  const defaultCategories = ['Fixas', 'Variáveis'];
  const isInitialCategoryCustom = initial?.category && !defaultCategories.includes(initial.category);
  const [title, setTitle] = useState(initial?.title || "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || ymd(new Date()));
  const [recurrence, setRecurrence] = useState<'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>(initial?.recurrence || "NONE");
  const [category, setCategory] = useState(initial?.category || "");
  const [customCategory, setCustomCategory] = useState(isInitialCategoryCustom ? initial?.category || '' : '');
  const [showCustomCategory, setShowCustomCategory] = useState(isInitialCategoryCustom || false);
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, []);

  const handleDueDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value);
  }, []);

  const handleRecurrenceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecurrence(e.target.value as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY');
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomCategory(true);
      setCategory('');
    } else {
      setShowCustomCategory(false);
      setCategory(value);
      setCustomCategory('');
    }
  }, []);

  const handleCustomCategoryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    setCategory(value);
  }, []);

  const handleTagsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }, []);

  const handleTagSuggestionClick = useCallback((suggestedTag: string) => {
    if (tags === suggestedTag) {
      // Remove a tag se já estiver selecionada
      setTags('');
    } else {
      // Define a nova tag (substitui a anterior)
      setTags(suggestedTag);
    }
  }, [tags]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações simples
    if (!title.trim()) {
      alert("Informe um título");
      titleInputRef.current?.focus();
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Informe um valor válido");
      return;
    }
    if (!dueDate) {
      alert("Informe o vencimento");
      return;
    }

    // Criação do objeto da conta
    const bill = {
      title: title.trim(),
      amount: Number(amount || 0),
      dueDate,
      recurrence,
      category: category.trim() || null,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      notes: notes.trim() || undefined,
      paid: initial?.paid || false,
      paidOn: initial?.paidOn || null,
    };
    
    // Chama função de salvar passada via props
    onSave(bill);

    // Fecha o modal
    onCancel();
  }, [title, amount, dueDate, recurrence, category, tags, notes, initial?.paid, initial?.paidOn, onSave, onCancel]);

  // Gerencia foco e tecla ESC
  useEffect(() => {
    // Foca no primeiro input quando o modal abre
    titleInputRef.current?.focus();
    
    // Calcula a largura da scrollbar antes de escondê-la
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Previne scroll do body e compensa a scrollbar
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    // Handler para tecla ESC
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Cleanup: restaura scroll e remove listener
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  // JSX do formulário
  return (
    // Overlay escuro cobrindo toda a tela, centraliza o modal
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      {/* Modal do formulário com fundo branco, dark mode, bordas arredondadas e sombra - responsivo */}
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-4xl mx-4 shadow-xl max-h-[100vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título do formulário (novo ou edição) */}
        <h2 id="form-title" className="text-xl font-semibold mb-6">{initial ? t.edit : t.new_bill}</h2>

        {/* Formulário com layout otimizado para modal maior */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primeira linha: Título e Valor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative">
              <Input 
                ref={titleInputRef}
                label="Título" 
                value={title} 
                onChange={handleTitleChange}
                maxLength={50}
                required
                aria-describedby={!title.trim() ? "title-error" : undefined}
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                {title.length}/50 caracteres
              </div>
            </div>

            <Input 
              label={`Valor (ex.: ${fmtMoney(4500, currency, locale)})`} 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={handleAmountChange}
              required
            />
          </div>

          {/* Segunda linha: Vencimento e Recorrência */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input label="Vencimento" type="date" value={dueDate} onChange={handleDueDateChange} />

            <Select label="Recorrência" value={recurrence} onChange={handleRecurrenceChange}>
              <option value="NONE">Sem recorrência</option>
              <option value="MONTHLY">Mensal</option>
              <option value="WEEKLY">Semanal</option>
              <option value="YEARLY">Anual</option>
            </Select>
          </div>

          {/* Terceira linha: Categoria */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select label="Categoria" value={showCustomCategory ? 'custom' : category} onChange={handleCategoryChange}>
              <option value="">Selecione uma categoria</option>
              <option value="Fixas">📌 Fixas</option>
              <option value="Variáveis">📦 Variáveis</option>
              <option value="custom">✏️ Categoria personalizada...</option>
            </Select>

            {/* Input para categoria personalizada */}
            {showCustomCategory && (
              <Input 
                label="Nome da categoria personalizada" 
                value={customCategory} 
                onChange={handleCustomCategoryChange}
                maxLength={50}
                placeholder="Digite o nome da categoria"
              />
            )}
          </div>

          {/* Seção de Tags otimizada para modal maior */}
          <div className="space-y-1">
            <label className="block text-sm  text-slate-700 dark:text-slate-300">
              Tag
            </label>
            
            {/* Tags sugeridas com layout otimizado */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {['🏠 Moradia', '⚡ Energia', '🚗 Transporte', '🍽️ Alimentação', '🎓 Educação', '🩺 Saúde', '💳 Financeiro', '🎉 Lazer', '👕 Pessoal', '💼 Trabalho', '📦 Compras', '📑 Impostos', '🚨 Urgente', '📅 Mensal', '💰 Investimento', '🎯 Meta'].map((suggestedTag) => {
                  const isSelected = tags === suggestedTag;
                  return (
                    <button
                      key={suggestedTag}
                      type="button"
                      onClick={() => handleTagSuggestionClick(suggestedTag)}
                      className={`px-2 py-2 text-sm rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 text-center font-medium ${
                        isSelected 
                          ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 hover:shadow-sm'
                      }`}
                    >
                      {suggestedTag}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Input para tag personalizada */}
            <div className="max-w-full">
              <Input 
                label="" 
                value={tags} 
                onChange={handleTagsChange} 
                placeholder="Digite uma tag personalizada..."
              />
            </div>
          </div>

          {/* Seção de Notas compacta */}
          <div className="space-y-2">
            <Textarea 
              label="Notas" 
              value={notes} 
              onChange={handleNotesChange}
              maxLength={255}
              placeholder="Adicione observações sobre esta conta..."
            />
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
              {notes.length}/255 caracteres
            </div>
          </div>

          {/* Botões de ação do formulário - responsivos */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
            {/* Botão de cancelar */}
            <button 
              type="button"
              onClick={onCancel} 
              className="w-full sm:w-auto sm:min-w-[80px] text-center px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 order-2 sm:order-1"
              aria-label={`${t.cancel} ${initial ? t.edit : t.new_bill}`}
            >
              {t.cancel}
            </button>

            {/* Botão de salvar */}
            <button
              type="submit"
              className="w-full sm:w-auto sm:min-w-[80px] text-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 order-1 sm:order-2"
              aria-label={`${t.save} ${initial ? t.edit : t.new_bill}`}
            >
              Salvar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
