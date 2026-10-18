interface LoaderProps {
  label?: string;
}

/**
 * `role="status"` is a polite live region: a screen reader announces
 * "Loading…" without interrupting, and the specs find it by role.
 */
export function Loader({ label = 'Loading…' }: LoaderProps) {
  return (
    <p role="status" className="loader">
      <progress aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}
