import { useId, memo } from 'react';
import * as Types from '@/types';
import { CSS_CLASSES, cn } from '@/styles/constants';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, Types.WithError {
  label: string;
  children: React.ReactNode;
}

const Select = memo(function Select({ label, children, error, className, ...props }: SelectProps) {
  const id = useId();
  const errorId = useId();

  const baseClass = cn(
    CSS_CLASSES.input.base,
    error ? CSS_CLASSES.input.error : CSS_CLASSES.input.default,
    className,
  );

  return (
    <div className="block mb-3 min-w-0">
      <label htmlFor={id} className="block text-sm text-slate-600 mb-1">
        {label}
        {props.required && <span className="text-red-500 ml-1" aria-label="campo obrigatório">*</span>}
      </label>

      <select
        {...props}
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={baseClass}
      >
        {children}
      </select>

      {error && (
        <div id={errorId} className={CSS_CLASSES.text.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

export default Select;
