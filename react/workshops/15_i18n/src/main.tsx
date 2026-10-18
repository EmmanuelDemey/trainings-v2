import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { App } from './App';
import { createI18n } from './i18n';
import './style.css';

// The browser's preferred language, when we have it; English otherwise.
const i18n = createI18n(navigator.language.startsWith('fr') ? 'fr' : 'en');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The instance every `useTranslation()` below reads. The specs wrap the
        app the same way, with a fresh instance per test. */}
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>,
);
