import { useTranslation } from 'react-i18next';
import { languages } from '../i18n';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <div role="group" aria-label={t('language')}>
      {languages.map((language) => (
        <button
          key={language}
          type="button"
          // `lang`: a screen reader reads "FR" with a French voice.
          lang={language}
          aria-pressed={i18n.resolvedLanguage === language}
          // Every component using `useTranslation` re-renders on the change.
          onClick={() => void i18n.changeLanguage(language)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
