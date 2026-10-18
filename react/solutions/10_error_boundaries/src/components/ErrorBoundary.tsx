import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface FallbackProps {
  error: Error;
  /** Clears the error and renders the children again. */
  reset: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** What to render instead of the children once one of them has thrown. */
  fallback: (props: FallbackProps) => ReactNode;
  /** Called by `reset()`: the place to fix the cause, or the children throw again. */
  onReset?: () => void;
  /** When any of these values changes, a caught error is cleared automatically. */
  resetKeys?: readonly unknown[];
  /** Called once per caught error: the place to report it. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function changed(previous: readonly unknown[] = [], next: readonly unknown[] = []): boolean {
  return previous.length !== next.length || previous.some((value, index) => !Object.is(value, next[index]));
}

/**
 * Still a class in React 19: `getDerivedStateFromError` and `componentDidCatch`
 * have no hook equivalent. Write it once, here — or use `react-error-boundary`.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  /** Render phase: turns the error into state, so the next render shows the fallback. */
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // Anything can be thrown; the fallback is promised an `Error`.
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  /** Commit phase: side effects — logging, reporting — belong here, not above. */
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    // Only an error that is ALREADY displayed is cleared: the keys changing in
    // the very render that threw must not swallow the error.
    if (this.state.error && changed(previousProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null });
    }
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return this.props.fallback({ error, reset: this.reset });
    }
    return this.props.children;
  }
}
