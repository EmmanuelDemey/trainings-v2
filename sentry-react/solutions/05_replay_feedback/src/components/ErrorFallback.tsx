import { useState, type FormEvent } from 'react';
import * as Sentry from '@sentry/react';

interface ErrorFallbackProps {
  readonly eventId: string;
  readonly resetError: () => void;
}

/** What the user sees instead of a blank page — and where they tell us what they were doing. */
export function ErrorFallback({ eventId, resetError }: ErrorFallbackProps) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function send(event: FormEvent) {
    event.preventDefault();
    // Linked to the crash: in Sentry, the feedback shows on the issue — with the replay.
    Sentry.captureFeedback({ message, associatedEventId: eventId });
    setSent(true);
  }

  return (
    <section className="panel fallback" data-testid="error-fallback">
      <h2>This issue could not be displayed</h2>
      <p>
        The error was reported. Reference: <code data-testid="error-event-id">{eventId}</code>
      </p>
      {sent ? (
        <p data-testid="feedback-sent">Thank you — your message was sent with the report.</p>
      ) : (
        <form data-testid="report-feedback" onSubmit={send}>
          <label>
            What were you doing?
            <textarea data-testid="feedback-message" value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>
          <button data-testid="feedback-submit" type="submit" disabled={message.trim() === ''}>
            Send
          </button>
        </form>
      )}
      <button onClick={resetError}>Try again</button>
    </section>
  );
}
