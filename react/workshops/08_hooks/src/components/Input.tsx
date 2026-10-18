import { useId, type ComponentProps } from 'react';

type InputProps = ComponentProps<'input'> & {
  label: string;
};

// React 19: `ref` is a plain prop. `ComponentProps<'input'>` includes it, the
// rest spread forwards it to the <input> — no `forwardRef` any more.
export function Input({ label, id, ...inputProps }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input {...inputProps} id={inputId} />
    </div>
  );
}
