// A <select> whose value is one of its options — as a type, not only at run time.
import { useState } from 'react';

/** TODO 7: the options keep their literal types, and `defaultValue` must be one of them. */
export interface SelectProps {
  label: string;
  options: readonly string[];
  defaultValue: string;
  onChange?: (value: string) => void;
}

export function Select({ label, options, defaultValue, onChange }: SelectProps) {
  const [value, setValue] = useState(defaultValue);
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => setValue(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
