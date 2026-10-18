import type { ComponentProps } from 'react';

/**
 * The three field components both forms are built with. Each one owns the
 * accessibility wiring, so no form can forget it:
 *
 * - `aria-invalid` tells a screen reader the field is wrong — and gives CSS a hook;
 * - `aria-describedby` points at the message, which is read with the field's label;
 * - the message's `id` is derived from the field's, so ids never collide.
 */

type TextFieldProps = ComponentProps<'input'> & { id: string; label: string; error?: string };

export function TextField({ id, label, error, ...inputProps }: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {/* `ref` is a plain prop in React 19: React Hook Form's `register()` passes through `inputProps`. */}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

type Option = { value: string; label: string };

type SelectFieldProps = ComponentProps<'select'> & {
  id: string;
  label: string;
  options: readonly Option[];
  error?: string;
};

export function SelectField({ id, label, options, error, ...selectProps }: SelectFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...selectProps}
      >
        <option value="">Choose…</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

type RadioGroupFieldProps = Omit<ComponentProps<'input'>, 'id' | 'type' | 'value' | 'defaultValue'> & {
  id: string;
  name: string;
  label: string;
  options: readonly Option[];
  error?: string;
  /** The option checked at first — the uncontrolled form uses it, React Hook Form does not. */
  defaultValue?: string;
};

export function RadioGroupField({ id, name, label, options, error, defaultValue, ...radioProps }: RadioGroupFieldProps) {
  const errorId = `${id}-error`;
  return (
    // A `<fieldset>` + `<legend>` is how a group of radios gets ONE label. The
    // `radiogroup` role is what may carry `aria-invalid`.
    <fieldset
      id={id}
      className="field"
      role="radiogroup"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>{label}</legend>
      {options.map((option) => (
        <label key={option.value} className="radio">
          <input
            type="radio"
            {...radioProps}
            name={name}
            value={option.value}
            defaultChecked={defaultValue === undefined ? undefined : defaultValue === option.value}
          />
          {option.label}
        </label>
      ))}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
