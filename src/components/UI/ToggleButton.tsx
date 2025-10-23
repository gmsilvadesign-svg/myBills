import * as Types from '@/types';

// Interface para as props do componente
interface ToggleButtonProps<T extends string> extends Types.WithAriaLabel {
  items: [T, string][];
  selected: T;
  onChange: (value: T) => void;
}

// Componente ToggleButton otimizado (React.memo não funciona bem com generics)
export default function ToggleButton<T extends string>({ items, selected, onChange, ariaLabel }: ToggleButtonProps<T>) {
  return (
    <div 
      className="flex rounded-xl overflow-hidden bg-slate-100 p-1 w-full sm:w-auto overflow-x-auto"
      role="group"
      aria-label={ariaLabel || "Opções de alternância"}
    >
      {items.map(([k, label]) => {
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            aria-pressed={selected === k}
            aria-label={`${label}${selected === k ? ' (selecionado)' : ''}`}
            className={`flex-1 sm:flex-none sm:min-w-[80px] px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100 whitespace-nowrap text-center zoom-500:text-xs zoom-500:px-2 zoom-500:py-1 ${
              selected === k
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
