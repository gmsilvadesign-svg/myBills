// Botão de toolbar estilizado
export default function ToolbarButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90">
      {children}
    </button>
  );
}