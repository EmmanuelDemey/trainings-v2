// The domain of a small library app. Everything else in src/ is DERIVED from
// these declarations: change a field here, and every type follows.

export const GENRES = ['novel', 'essay', 'comic', 'poetry'] as const;

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: (typeof GENRES)[number];
  publishedAt: Date;
  summary?: string;
  tags: string[];
}

export const defaultSettings = {
  pageSize: 20,
  sortBy: 'title',
  showCovers: true,
};
