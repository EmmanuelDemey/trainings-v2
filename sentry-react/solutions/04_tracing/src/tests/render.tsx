import { render } from '@testing-library/react';
import { App } from '../App';

/** The whole app, as `main.tsx` renders it — minus `<StrictMode>`, which doubles every effect. */
export function renderApp(): void {
  render(<App />);
}
