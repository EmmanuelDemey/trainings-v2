import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();

  return (
    <header>
      <div>
        <h1>{t('title')}</h1>
        <p>{t('intro')}</p>
      </div>
      <LanguageSwitcher />
    </header>
  );
}
