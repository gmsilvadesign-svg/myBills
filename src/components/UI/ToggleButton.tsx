// Importa a biblioteca clsx para concatenar classes condicionalmente
import clsx from 'clsx';

export default function ToggleButton({ items, selected, onChange }) {

  // JSX do grupo de botões toggle
  return (
    // Container principal com borda arredondada e overflow escondido
    <div className="flex rounded-2xl overflow-hidden border border-slate-300">

      {/* Mapeia cada item e cria um botão */}
      {items.map(([k, label]) => (
        <button 
          key={k} 
          onClick={() => onChange(k)} // Atualiza o botão selecionado
          className={clsx(
            "px-3 py-2",
            // Aplica classes diferentes se o botão estiver selecionado ou não
            selected === k
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700"
          )}
        >
          {label} {/* Texto do botão */}
        </button>
      ))}

    </div>
  );
}