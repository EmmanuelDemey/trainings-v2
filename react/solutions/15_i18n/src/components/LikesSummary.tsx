import { useTranslation } from 'react-i18next';

interface LikesSummaryProps {
  count: number;
}

export function LikesSummary({ count }: LikesSummaryProps) {
  const { t } = useTranslation();
  // `count` is special: it interpolates `{{count}}` AND selects the plural
  // form — `likes_one`, `likes_other`… — through `Intl.PluralRules`.
  return <p role="status">{t('likes', { count })}</p>;
}
