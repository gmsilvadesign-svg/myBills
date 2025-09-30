import { useMemo, useState } from 'react';
import { CSS_CLASSES, cn } from '@/styles/constants';
import type * as Types from '@/types';

interface BooksLandingProps {
  userName?: string | null;
  books: Types.Book[];
  loading?: boolean;
  onSelect: (bookId: string) => void;
  onCreate: (name?: string) => Promise<void> | void;
  onDelete: (bookId: string) => Promise<void> | void;
}

export default function BooksLanding({ userName, books, loading = false, onSelect, onCreate, onDelete }: BooksLandingProps) {
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const greeting = useMemo(() => {
    if (!userName) return 'Bem-vindo ao myBills';
    return `Ola, ${userName}`;
  }, [userName]);

  const handleConfirmCreate = async (skipName?: boolean) => {
    try {
      setIsSubmitting(true);
      await onCreate(skipName ? undefined : draftName.trim());
      setDraftName('');
      setCreating(false);
    } catch (error) {
      console.error('[BooksLanding] create book error', error);
      alert('Nao foi possivel criar o book. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    const shouldDelete = window.confirm('Excluir este book? Essa acao nao pode ser desfeita.');
    if (!shouldDelete) return;
    try {
      setDeletingId(bookId);
      await onDelete(bookId);
    } catch (error) {
      console.error('[BooksLanding] delete book error', error);
      alert('Nao foi possivel excluir o book. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const isEmpty = !books.length && !loading;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{greeting}</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Organize seus controles financeiros em books separados e acompanhe resultados com mais clareza.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={cn(CSS_CLASSES.button.primary, 'flex items-center gap-2')}
          >
            + Novo controle
          </button>
        </header>

        {creating && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Nome do novo book</h2>
            <input
              autoFocus
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Ex.: Controle familiar"
              maxLength={20}
              className={cn(CSS_CLASSES.input.base, CSS_CLASSES.input.default)}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleConfirmCreate(false)}
                className={CSS_CLASSES.button.primary}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Criando...' : 'Criar agora'}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCreate(true)}
                className={CSS_CLASSES.button.secondary}
                disabled={isSubmitting}
              >
                Pular (usar nome padrao)
              </button>
              <button type="button" onClick={() => setCreating(false)} className={CSS_CLASSES.button.ghost} disabled={isSubmitting}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Seus books financeiros</h2>
          {loading && !books.length ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-8 text-center text-slate-500 dark:text-slate-300">
              Carregando books...
            </div>
          ) : isEmpty ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-8 text-center text-slate-500 dark:text-slate-300">
              Nenhum book ainda. Clique em "Novo controle" para comecar.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {books.map((book) => {
                const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(book.createdAt));
                return (
                  <article
                    key={book.id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <header className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{book.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Criado em {formattedDate}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDelete(book.id)}
                        className={CSS_CLASSES.button.ghost}
                        disabled={deletingId === book.id || books.length <= 1}
                        title={books.length <= 1 ? 'Mantenha pelo menos um book ativo' : undefined}
                      >
                        {deletingId === book.id ? 'Excluindo...' : books.length <= 1 ? 'Indisponível' : 'Excluir'}
                      </button>
                    </header>
                    <footer className="mt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onSelect(book.id)}
                        className={cn(CSS_CLASSES.button.primary, 'flex-1')}
                      >
                        Abrir book
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
