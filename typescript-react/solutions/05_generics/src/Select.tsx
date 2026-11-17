// A <select> whose value is one of its options — as a type, not only at run time.
import { useState } from 'react';

export interface SelectProps<T extends string> {
  label: string;
  options: readonly T[];
  defaultValue: NoInfer<T>;
  onChange?: (value: T) => void;
}

/** The options keep their literal types, and `defaultValue` must be one of them. */
export function Select<T extends string>({ label, options, defaultValue, onChange }: SelectProps<T>) {
  const [value, setValue] = useState<T>(defaultValue);
  return (
    <label>
      {label}
      <select
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option === event.target.value) ?? defaultValue;
          setValue(next);
          onChange?.(next);
        }}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
