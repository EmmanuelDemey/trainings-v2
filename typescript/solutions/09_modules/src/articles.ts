import { slugify } from 'slugify-lite';
import { emit } from './events.ts';

// The events of the articles, added to the bus's `EventMap`: module
// augmentation — two `interface EventMap` declarations merge into one.
declare module './events.ts' {
  interface EventMap {
    'article:published': { slug: string; title: string };
  }
}

export interface Article {
  title: string;
  slug: string;
  publishedAt: Date;
}

/** Publishes an article: its slug is at most 40 characters long. */
export function publish(title: string, now: Date = new Date()): Article {
  const slug = slugify(title, { maxLength: 40 });
  emit('article:published', { slug, title });
  return { title, slug, publishedAt: now };
}
