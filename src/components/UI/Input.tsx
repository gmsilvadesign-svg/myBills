import { useId, forwardRef } from 'react';
import * as Types from '@/types';

// Interface para as props do componente
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, Types.WithError {
  label: string;
}

// Input com label estilizado e acessibilidade aprimorada
const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => {
  const id = useId();
  const errorId = useId();

  // JSX do input com label
  return (
    // Container do campo
    <div className="block mb-3 min-w-0">
      {/* Label associado ao input */}
      <label htmlFor={id} className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
        {label}
        {props.required && <span className="text-red-500 ml-1" aria-label="campo obrigatório">*</span>}
      </label>

      {/* Input propriamente dito, recebe props passadas e estilização */}
      <input 
        {...props}
        ref={ref}
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`w-full px-3 py-2 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400' 
            : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#AABBCC]/10 dark:border-[#AABBCC]/30 dark:text-slate-50 dark:focus:border-[#AABBCC] dark:focus:ring-[#AABBCC] backdrop-blur-sm'
        }`}
      />
      
      {/* Mensagem de erro */}
      {error && (
        <div id={errorId} className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;