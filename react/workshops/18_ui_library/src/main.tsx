import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// TODO 2.4: gone once MUI and CssBaseline style the page.
import './style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
