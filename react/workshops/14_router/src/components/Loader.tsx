interface LoaderProps {
  label?: string;
}

/** A polite live region: screen readers announce it without moving the focus. */
export function Loader({ label = 'Loading…' }: LoaderProps) {
  return (
    <p role="status" className="loader">
      {label}
    </p>
  );
}
