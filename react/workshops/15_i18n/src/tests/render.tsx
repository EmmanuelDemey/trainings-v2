import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { App } from '../App';
import { createI18n, type Language } from '../i18n';

/** Renders the app with its own, fresh i18next instance in `lng`. */
export function renderApp(lng: Language = 'en') {
  const i18n = createI18n(lng);
  render(
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>,
  );
  return i18n;
}
