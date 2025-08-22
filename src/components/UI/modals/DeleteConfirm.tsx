import { useEffect, useRef } from 'react';

// Interface para as props do componente
interface DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  t: Record<string, string>; // Traduções
}

// Modal de confirmação com título, corpo e botões - acessibilidade aprimorada
export default function DeleteConfirm({ open, onClose, onConfirm, title, body, t }: DeleteConfirmProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Gerencia foco e tecla ESC
  useEffect(() => {
    if (open) {
      // Foca no botão cancelar quando o modal abre
      cancelButtonRef.current?.focus();
      
      // Calcula a largura da scrollbar antes de escondê-la
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Previne scroll do body e compensa a scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Handler para tecla ESC
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onClose]);

  // Se o modal não estiver aberto, não renderiza nada
  if (!open) return null;

  // JSX do modal
  return (
    // Container do modal com fundo semitransparente e centralizado
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Caixa do modal com fundo, cantos arredondados e sombra */}
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título do modal */}
        <div id="modal-title" className="text-lg font-semibold mb-2">{title}</div>

        {/* Corpo do modal */}
        <div id="modal-description" className="text-slate-600 dark:text-slate-300 mb-6">{body}</div>

        {/* Botões de ação */}
        <div className="flex gap-3 justify-end">
          {/* Botão de cancelar: apenas fecha o modal */}
          <button 
            ref={cancelButtonRef}
            onClick={onClose} 
            className="min-w-[80px] text-center px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
          >
            {t.cancel}
          </button>

          {/* Botão de confirmar: executa ação e fecha o modal */}
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="min-w-[80px] text-center px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
