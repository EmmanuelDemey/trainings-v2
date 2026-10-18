interface LikesSummaryProps {
  count: number;
}

export function LikesSummary({ count }: LikesSummaryProps) {
  // TODO 4.2: `t('likes', { count })` — `count` both fills `{{count}}` and picks
  //   the plural form (`likes_one`, `likes_other`, …).
  return <p role="status">You like {count} characters.</p>;
}
