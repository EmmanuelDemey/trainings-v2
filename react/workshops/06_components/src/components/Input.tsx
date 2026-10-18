import type { ComponentProps } from 'react';

// TODO 2.1: accept every prop a native <input> accepts, plus `label` and an
//           optional `hint` — `ComponentProps<'input'>` gives you the first part.
type InputProps = ComponentProps<'input'> & {
  label: string;
  hint?: string;
};

export function Input(props: InputProps) {
  // TODO 2.2: a <div className="field"> with a <label> tied to the <input>
  //           through an id from `useId()` (a caller-provided `id` wins).
  // TODO 2.3: spread the remaining props on the <input>.
  // TODO 2.4: when there is a `hint`, render it in a <p className="hint"> and
  //           point the input's `aria-describedby` at it.
  return null;
}
