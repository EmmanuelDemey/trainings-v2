import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  // TODO 2.1: `const { t } = useTranslation()`, then `t('title')` and `t('intro')`.
  return (
    <header>
      <div>
        <h1>Star Wars people</h1>
        <p>Every character of the original trilogy, at a glance.</p>
      </div>
      <LanguageSwitcher />
    </header>
  );
}
