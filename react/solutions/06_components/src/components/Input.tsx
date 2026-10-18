import { useId, type ComponentProps } from 'react';

// Every prop a native <input> accepts — `type`, `value`, `onChange`,
// `placeholder`, `aria-*`… — plus the two this component adds. No need to
// re-declare them one by one, and the call sites keep their autocompletion.
type InputProps = ComponentProps<'input'> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, ...inputProps }: InputProps) {
  // `useId` gives an id unique to this instance — two <Input> on the same page
  // never collide. A caller-provided `id` still wins.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      {/* The spread comes FIRST: the id and the description computed here
          must win over whatever was passed through. */}
      <input {...inputProps} id={inputId} aria-describedby={hint ? hintId : undefined} />
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
    </div>
  );
}
