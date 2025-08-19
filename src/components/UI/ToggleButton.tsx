// Importa a biblioteca clsx para concatenar classes condicionalmente
import clsx from 'clsx';

export default function ToggleButton({ items, selected, onChange }) {

  // JSX do grupo de botões toggle
  return (
    // Container principal com borda arredondada e overflow escondido
    <div className="flex rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700">

      {/* Mapeia cada item e cria um botão */}
      {items.map(([k, label]) => (
        <button 
          key={k} 
          onClick={() => onChange(k)} // Atualiza o botão selecionado
          className={clsx(
            "px-3 py-2 text-[#E3E3E3]",
            // Aplica classes diferentes se o botão estiver selecionado ou não
            selected === k
              ? "bg-slate-900 dark:bg-slate-100 dark:text-slate-900"
              : "bg-white dark:bg-slate-900"
          )}
        >
          {label} {/* Texto do botão */}
        </button>
      ))}

    </div>
  );
}