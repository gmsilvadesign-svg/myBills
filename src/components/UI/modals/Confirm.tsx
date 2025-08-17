// Modal de confirmação com título, corpo e botões
export default function Confirm({ open, onClose, onConfirm, title, body, t }) {
  if (!open) return null; // não renderiza se fechado
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="text-slate-600 dark:text-slate-300 mb-6">{body}</div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800">{t.cancel}</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded-xl bg-red-600 text-white">{t.confirm}</button>
        </div>
      </div>
    </div>
  );
}