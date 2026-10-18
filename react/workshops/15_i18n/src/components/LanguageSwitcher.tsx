import { languages } from '../i18n';

export function LanguageSwitcher() {
  // TODO 3.1: get `{ t, i18n }` from `useTranslation()` (from 'react-i18next'):
  //   - the group's label is `t('language')`
  //   - a button is pressed when `i18n.resolvedLanguage` is its language
  //   - a click calls `i18n.changeLanguage(language)` (prefix it with `void`)
  return (
    <div role="group" aria-label="Language">
      {languages.map((language) => (
        <button key={language} type="button" lang={language} aria-pressed={language === 'en'}>
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
