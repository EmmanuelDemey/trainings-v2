import type { ReactElement } from 'react';
import { slugify } from 'slugify-lite';
import { Badge } from './Badge.tsx';

export interface ArticleCardProps {
  title: string;
  tags?: readonly string[];
}

/** The card of an article: its heading carries an anchor, at most 40 characters long. */
export function ArticleCard({ title, tags = [] }: ArticleCardProps): ReactElement {
  const slug = slugify(title, { maxLength: 40 });
  return (
    <article>
      <h2 id={slug}>{title}</h2>
      {tags.map((tag) => (
        <Badge key={tag} color="tomato">
          {tag}
        </Badge>
      ))}
    </article>
  );
}
