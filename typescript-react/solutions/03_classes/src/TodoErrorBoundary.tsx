// The one class component React still needs: no hook catches a render error.
import { Component, type ReactNode } from 'react';
import { TodoNotFoundError } from './todo-store.ts';

interface Props {
  children: ReactNode;
}

interface State {
  error: unknown;
}

/** Shows "No todo with id …" when a child throws a TodoNotFoundError — and lets any other error through. */
export class TodoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (error instanceof TodoNotFoundError) return <p role="alert">{error.message}</p>;
    if (error) throw error;
    return this.props.children;
  }
}
