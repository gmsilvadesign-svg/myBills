import { useId } from 'react';
import * as Types from '@/types';

// Interface para as props do componente
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, Types.WithError {
  label: string;
}

// Textarea com label estilizado e acessibilidade aprimorada
export default function Textarea({ label, error, ...props }: TextareaProps) {
  const id = useId();
  const errorId = useId();

  // JSX do textarea com label
  return (
    // Container do campo
    <div className="block mb-3 min-w-0">
      {/* Label associado ao textarea */}
      <label htmlFor={id} className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
        {label}
        {props.required && <span className="text-red-500 ml-1" aria-label="campo obrigatório">*</span>}
      </label>

      {/* Textarea propriamente dito, recebe props passadas e estilização */}
      <textarea 
        {...props}
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`w-full rounded-xl border px-3 py-2 h-24 focus:outline-none focus:ring-2 transition-colors resize-vertical ${
          error 
            ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
            : 'border-slate-300 focus:ring-slate-400 focus:border-slate-400'
        } dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
      />

      {/* Mensagem de erro */}
      {error && (
        <div id={errorId} className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}