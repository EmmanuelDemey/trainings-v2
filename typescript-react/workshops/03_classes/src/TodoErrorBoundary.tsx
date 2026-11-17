// The one class component React still needs: no hook catches a render error.
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: unknown;
}

/**
 * TODO 1: shows the message of a TodoNotFoundError thrown by a child, in a
 * `<p role="alert">` — and lets any other error through. Start the state in the
 * constructor, fill it in `static getDerivedStateFromError`, and read it in
 * `render`, marked `override`.
 */
export class TodoErrorBoundary extends Component<Props, State> {
  render(): ReactNode {
    return this.props.children;
  }
}
