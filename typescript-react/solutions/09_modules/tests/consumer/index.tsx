// An app that installs the component library: it imports it by its NAME, through
// the `exports` of package.json, and only ever sees dist/ — the .js and the .d.ts.
import { ArticleCard, type ArticleCardProps } from 'tp-react-09-modules';

const props: ArticleCardProps = { title: 'Hello from a consumer', tags: ['react'] };

export const card = <ArticleCard {...props} />;
export const badge = <span style={{ '--badge-color': 'tomato' }} />;
