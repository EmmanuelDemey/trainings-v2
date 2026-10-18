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

/**
 * Still a class in React 19: `getDerivedStateFromError` and `componentDidCatch`
 * have no hook equivalent.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  // TODO 1.1: a state `{ error: Error | null }`, starting with `null`.
  // TODO 1.2: `static getDerivedStateFromError(error)` — turn the thrown value
  //           into that state (anything can be thrown: wrap a non-Error).
  // TODO 1.3: `reset` — an arrow function property that calls `onReset`, then
  //           clears the error.
  // TODO 3.1: `componentDidCatch(error, info)` — call `onError`.
  // TODO 3.2: `componentDidUpdate(previousProps)` — clear a DISPLAYED error when
  //           one of the `resetKeys` changed (compare them with `Object.is`).

  render() {
    // TODO 1.4: render `this.props.fallback({ error, reset })` while there is an error.
    return this.props.children;
  }
}
