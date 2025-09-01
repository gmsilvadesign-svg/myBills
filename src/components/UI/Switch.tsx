import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
}

export default function Switch({ checked, onChange, disabled, label, ariaLabel }: SwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label || 'Alternar'}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
      {label && (
        <span className="text-sm text-slate-700 dark:text-slate-200 select-none">{label}</span>
      )}
    </div>
  );
}

