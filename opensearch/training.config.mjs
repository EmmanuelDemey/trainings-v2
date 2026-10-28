// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'OpenSearch',
  slug: 'opensearch',
  author: 'Emmanuel Demey',
  // The training is given in French.
  lang: 'fr',

  // One Markdown file per chapter, in the order of its number. The end-of-day
  // retro lives in slides/shared/ — a sub-folder, so not a chapter — and is
  // imported at the end of the last chapter.
  slides: 'slides',
  workshops: 'workshops',
  // The learners write the requests, run in OpenSearch Dashboards Dev Tools
  // against their own cluster: the README gives the goal, a hint and the expected
  // response. The requests live in solutions/<workshop>/SOLUTION.md, for the
  // trainer and the CI only — never published, hence `false` — and there is no
  // online editor.
  solutions: false,

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'opensearch' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## OpenSearch\nFormation OpenSearch — 1 jour : architecture, indexation, recherche, analyse, agrégations, ingest pipelines et OpenSearch Dashboards.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
