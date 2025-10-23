import { useId, forwardRef } from 'react';
import * as Types from '@/types';
import { CSS_CLASSES, cn } from '@/styles/constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, Types.WithError {
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => {
  const id = useId();
  const errorId = useId();

  const baseClass = cn(
    CSS_CLASSES.input.base,
    error ? CSS_CLASSES.input.error : CSS_CLASSES.input.default,
    className,
  );

  return (
    <div className="block mb-3 min-w-0">
      <label htmlFor={id} className={CSS_CLASSES.text.label}>
        {label}
        {props.required && <span className="text-red-500 ml-1" aria-label="campo obrigatório">*</span>}
      </label>

      <input
        {...props}
        ref={ref}
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
});

Input.displayName = 'Input';

export default Input;
