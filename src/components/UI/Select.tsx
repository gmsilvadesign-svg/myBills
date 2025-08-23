import { useId, memo } from 'react';
import * as Types from '@/types';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, Types.WithError {
  label: string;
  children: React.ReactNode;
}

const Select = memo(function Select({ label, children, error, ...props }: SelectProps) {
  const id = useId();
  const errorId = useId();

  return (
    <div className="block mb-3 min-w-0">
      <label htmlFor={id} className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
        {label}
        {props.required && <span className="text-red-500 ml-1" aria-label="campo obrigatório">*</span>}
      </label>

      {/* Select propriamente dito, recebe props passadas e estilização */}
      <select 
        {...props}
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`w-full px-3 py-2 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400' 
            : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#AABBCC]/10 dark:border-[#AABBCC]/30 dark:text-slate-50 dark:focus:border-[#AABBCC] dark:focus:ring-[#AABBCC] backdrop-blur-sm'
        } [&>option]:dark:bg-slate-800 [&>option]:dark:text-slate-50`}
      >
        {children}
      </select>

      {/* Mensagem de erro */}
      {error && (
        <div id={errorId} className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

export default Select;