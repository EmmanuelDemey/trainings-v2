interface ErrorMessageProps {
  message: string;
  /** When given, a "Retry" button calls it. */
  onRetry?: () => void;
}

/** `role="alert"` is announced immediately: an error must not go unnoticed. */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="error-message">
      <p>
        <strong>Loading error:</strong> {message}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
