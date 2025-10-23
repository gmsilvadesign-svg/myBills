import { useId } from 'react';
import * as Types from '@/types';
import { CSS_CLASSES, cn } from '@/styles/constants';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, Types.WithError {
  label: string;
}

export default function Textarea({ label, error, className, ...props }: TextareaProps) {
  const id = useId();
  const errorId = useId();

  const baseClass = cn(
    CSS_CLASSES.input.base,
    'h-24 resize-vertical',
    error ? CSS_CLASSES.input.error : CSS_CLASSES.input.default,
    className,
  );

  return (
    <div className="block mb-3 min-w-0">
      <label htmlFor={id} className={CSS_CLASSES.text.label}>
        {label}
        {props.required && <span className="text-red-500 ml-1" aria-label="campo obrigatório">*</span>}
      </label>

      <textarea
        {...props}
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={baseClass}
      />

      {error && (
        <div id={errorId} className={CSS_CLASSES.text.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
