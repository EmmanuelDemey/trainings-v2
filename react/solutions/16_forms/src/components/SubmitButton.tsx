import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

/**
 * `useFormStatus` reads the status of the PARENT `<form>` — which is why this
 * has to be a component of its own, rendered inside the form. Called in the
 * component that renders the `<form>`, it would always say `pending: false`.
 */
export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving…' : children}
    </button>
  );
}
