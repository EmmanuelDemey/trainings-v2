import type { ComponentProps } from 'react';

/**
 * The three field components both forms are built with. Each one will own the
 * accessibility wiring (step 4), so that no form can forget it.
 *
 * TODO 4.1: on the input / select, `aria-invalid` when there is an `error`.
 * TODO 4.2: give the message an id derived from the field's (`${id}-error`), and
 *           point `aria-describedby` at it — only when there is an error.
 * TODO 4.3: the same on the radio group's `<fieldset role="radiogroup">`.
 */

type TextFieldProps = ComponentProps<'input'> & { id: string; label: string; error?: string };

export function TextField({ id, label, error, ...inputProps }: TextFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {/* `ref` is a plain prop in React 19: React Hook Form's `register()` passes through `inputProps`. */}
      <input
        id={id}
        {...inputProps}
      />
      {error && (
        <p className="field-error">
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
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
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
        <p className="field-error">
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
  return (
    // A `<fieldset>` + `<legend>` is how a group of radios gets ONE label. The
    // `radiogroup` role is what may carry `aria-invalid`.
    <fieldset
      id={id}
      className="field"
      role="radiogroup"
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
        <p className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
