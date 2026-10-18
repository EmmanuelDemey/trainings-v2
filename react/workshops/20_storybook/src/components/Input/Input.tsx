import { useId, type ComponentProps } from 'react';
import './Input.css';

export type InputProps = ComponentProps<'input'> & {
  label: string;
  /** When set, the field is marked invalid and the message is announced with it. */
  error?: string;
};

export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
