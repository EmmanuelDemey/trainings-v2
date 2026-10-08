// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Elasticsearch',
  slug: 'elasticsearch',
  author: 'Emmanuel Demey',
  // The workshops are written in French.
  lang: 'fr',

  // One Markdown file per chapter, in the order of its number. Images live in
  // slides/public/images/ and are referenced as /images/….
  slides: 'slides',
  workshops: 'workshops',
  // The workshops are guided: every request and its expected response is in
  // the README, run in Kibana Dev Tools against the learner's own cluster.
  // There is no code to hand out, hence no solutions — and no online editor.
  solutions: false,

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'elasticsearch' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Elasticsearch\nElasticsearch training — 3 days: fundamentals, performance, production.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
