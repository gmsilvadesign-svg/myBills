import { memo } from 'react';
import * as Types from '@/types';
import { CSS_CLASSES, cn } from '@/styles/constants';

interface ToolbarButtonProps extends Types.WithAriaLabel {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const ToolbarButton = memo(function ToolbarButton({ onClick, children, ariaLabel, disabled = false }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        CSS_CLASSES.button.secondary,
        'px-4 py-3 rounded-2xl font-medium transition-all duration-200',
        disabled ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'hover:scale-105',
      )}
    >
      {children}
    </button>
  );
});

export default ToolbarButton;
