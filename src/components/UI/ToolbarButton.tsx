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
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`px-4 py-3 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled 
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
          : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 focus:ring-blue-400 shadow-sm hover:shadow-md hover:scale-105'
      }`}
    >
      {children}
    </button>
  );
})

export default ToolbarButton

