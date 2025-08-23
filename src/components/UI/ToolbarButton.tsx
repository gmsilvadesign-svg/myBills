// Importa React.memo para otimização de performance
import { memo } from 'react'

import * as Types from '@/types';

// Interface para as props do componente
interface ToolbarButtonProps extends Types.WithAriaLabel {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

// Botão de toolbar estilizado com acessibilidade aprimorada - otimizado com React.memo
const ToolbarButton = memo(function ToolbarButton({ onClick, children, ariaLabel, disabled = false }: ToolbarButtonProps) {

  // JSX do botão com estilização e comportamento ao clicar
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`px-4 py-3 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
        disabled 
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400 shadow-none transform-none'
          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-400'
      }`}
    >
      {children} {/* Conteúdo do botão (texto ou ícone) */}
    </button>
  );
})

export default ToolbarButton