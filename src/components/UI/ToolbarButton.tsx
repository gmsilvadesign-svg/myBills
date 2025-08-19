// Botão de toolbar estilizado
export default function ToolbarButton({ onClick, children }) {

  // JSX do botão com estilização e comportamento ao clicar
  return (
    <button 
      onClick={onClick} // Chama função ao clicar
      className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
    >
      {children} {/* Conteúdo do botão (texto ou ícone) */}
    </button>
  );
}