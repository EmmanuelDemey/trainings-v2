// A project that installs the blog package: it imports it by its NAME, through
// the `exports` of package.json, and only ever sees dist/ — the .js and the .d.ts.
import { publish, type Article } from 'tp-09-modules';

export const article: Article = publish('Hello from a consumer');
export const slug: string = article.slug;
