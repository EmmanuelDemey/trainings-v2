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
      {/* TODO (step 2): a form `report-feedback` — a textarea `feedback-message` and a
          submit button `feedback-submit` — that calls
          `Sentry.captureFeedback({ message, associatedEventId: eventId })`.
          TODO (step 3): then, instead of the form, `feedback-sent`. */}
      <button onClick={resetError}>Try again</button>
    </section>
  );
}
