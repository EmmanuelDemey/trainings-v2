// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Elasticsearch',
  slug: 'elasticsearch',
  author: 'Emmanuel Demey',
  // The workshops are written in English.
  lang: 'en',

  // One Markdown file per chapter, in the order of its number. Images live in
  // slides/public/images/ and are referenced as /images/….
  slides: 'slides',
  workshops: 'workshops',
  // The learners write the requests, run in Kibana Dev Tools against their own
  // cluster: the README gives the goal, a hint and the expected response. The
  // requests live in solutions/<workshop>/SOLUTION.md, replayed by the CI and
  // published as a ZIP per workshop on the Resources page. No online editor.
  solutions: 'solutions',

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'elasticsearch' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Elasticsearch\nElasticsearch training — 3 days: indexing, search and aggregation, then testing, installing and operating your cluster.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
