import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface FallbackProps {
  error: Error;
  /** Clears the error and renders the children again. */
  reset: () => void;
}

interface ErrorBoundaryProps {
  fallback: (props: FallbackProps) => ReactNode;
  /** When one of these values changes, a displayed error is cleared. */
  resetKeys?: unknown[];
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** The error boundary of chapter 10 — still a class: hooks cannot catch. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught', error, info.componentStack);
  }

  componentDidUpdate(previous: ErrorBoundaryProps): void {
    const { resetKeys = [] } = this.props;
    const previousKeys = previous.resetKeys ?? [];
    const changed =
      resetKeys.length !== previousKeys.length ||
      resetKeys.some((key, index) => !Object.is(key, previousKeys[index]));
    if (this.state.error && changed) this.reset();
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) return this.props.fallback({ error, reset: this.reset });
    return this.props.children;
  }
}
