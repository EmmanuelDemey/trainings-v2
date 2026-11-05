interface ErrorFallbackProps {
  readonly eventId: string;
  readonly resetError: () => void;
}

/** What the user sees instead of a blank page — with the id support can search for. */
export function ErrorFallback({ eventId, resetError }: ErrorFallbackProps) {
  return (
    <section className="panel fallback" data-testid="error-fallback">
      <h2>This issue could not be displayed</h2>
      <p>
        The error was reported. Reference: <code data-testid="error-event-id">{eventId}</code>
      </p>
      <button onClick={resetError}>Try again</button>
    </section>
  );
}
