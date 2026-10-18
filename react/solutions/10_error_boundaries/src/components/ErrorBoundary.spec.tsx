import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary, type FallbackProps } from './ErrorBoundary';

/** Throws while rendering as long as `explode` is true. */
function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('Boom');
  return <p>All good</p>;
}

function Fallback({ error, reset }: FallbackProps) {
  return (
    <div role="alert">
      <p>Caught: {error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}

describe('ErrorBoundary', () => {
  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary fallback={Fallback}>
        <Bomb explode={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the fallback, with the error, when a child throws while rendering', () => {
    // React logs every error a boundary catches: keep the test output clean.
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={Fallback}>
        <Bomb explode />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Caught: Boom');
  });

  it('only replaces its own subtree', () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <>
        <h1>Still here</h1>
        <ErrorBoundary fallback={Fallback}>
          <Bomb explode />
        </ErrorBoundary>
      </>,
    );

    expect(screen.getByRole('heading', { name: 'Still here' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onError once with the caught error', () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={Fallback} onError={onError}>
        <Bomb explode />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]?.[0]).toMatchObject({ message: 'Boom' });
  });

  it('calls onReset, then renders the children again, when the fallback resets', async () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let explode = true;
    const onReset = vi.fn(() => {
      explode = false;
    });
    function Flaky() {
      return <Bomb explode={explode} />;
    }

    render(
      <ErrorBoundary fallback={Fallback} onReset={onReset}>
        <Flaky />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears the error by itself when one of its resetKeys changes', () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary fallback={Fallback} resetKeys={['IG-88']}>
        <Bomb explode />
      </ErrorBoundary>,
    );
    rerender(
      <ErrorBoundary fallback={Fallback} resetKeys={['Luke']}>
        <Bomb explode={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('keeps the fallback when it re-renders with the same resetKeys', () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary fallback={Fallback} resetKeys={['IG-88']}>
        <Bomb explode />
      </ErrorBoundary>,
    );
    rerender(
      <ErrorBoundary fallback={Fallback} resetKeys={['IG-88']}>
        <Bomb explode={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Caught: Boom');
  });
});
