import { slugify } from 'slugify-lite';

// TODO 2: add the 'article:published' event to the bus's `EventMap` — by
// module augmentation of './events.ts' — and emit it from `publish`.

export interface Article {
  title: string;
  slug: string;
  publishedAt: Date;
}

/** Publishes an article: its slug is at most 40 characters long. */
export function publish(title: string, now: Date = new Date()): Article {
  const slug = slugify(title, { maxLength: 40 });
  return { title, slug, publishedAt: now };
}
