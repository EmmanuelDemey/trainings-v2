interface LoaderProps {
  label?: string;
}

export function Loader({ label = 'Loading…' }: LoaderProps) {
  // TODO 3.1: render an element with `role="status"` showing the `label`
  // (and a `<progress>` without a value, for the eyes).
  void label;
  return null;
}
