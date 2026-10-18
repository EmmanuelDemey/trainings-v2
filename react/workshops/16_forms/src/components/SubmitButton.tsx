import type { ReactNode } from 'react';

export function SubmitButton({ children }: { children: ReactNode }) {
  // TODO 2.5: read `pending` with `useFormStatus()` (from 'react-dom'): disable
  //           the button and show 'Saving…' while the form's action runs.
  return <button type="submit">{children}</button>;
}
