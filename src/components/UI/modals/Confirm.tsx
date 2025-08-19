// Modal de confirmação com título, corpo e botões
export default function Confirm({ open, onClose, onConfirm, title, body, t }) {

  // Se o modal não estiver aberto, não renderiza nada
  if (!open) return null;

  // JSX do modal
  return (
    // Container do modal com fundo semitransparente e centralizado
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* Caixa do modal com fundo, cantos arredondados e sombra */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

        {/* Título do modal */}
        <div className="text-lg font-semibold mb-2">{title}</div>

        {/* Corpo do modal */}
        <div className="text-slate-600 mb-6">{body}</div>

        {/* Botões de ação */}
        <div className="flex gap-3 justify-end">

          {/* Botão de cancelar: apenas fecha o modal */}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200"
          >
            {t.cancel}
          </button>

          {/* Botão de confirmar: executa ação e fecha o modal */}
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="px-4 py-2 rounded-xl bg-red-600 text-white"
          >
            {t.confirm}
          </button>

        </div>

      </div>
    </div>
  );
}
