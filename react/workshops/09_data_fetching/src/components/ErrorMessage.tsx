interface ErrorMessageProps {
  message: string;
  /** When given, a "Retry" button calls it. */
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  // TODO 3.2: render an element with `role="alert"` showing the `message`,
  // and a "Retry" button calling `onRetry` — only when `onRetry` is given.
  void message;
  void onRetry;
  return null;
}
