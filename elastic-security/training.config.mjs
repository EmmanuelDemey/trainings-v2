// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Elastic Security for SIEM',
  slug: 'elastic-security',
  author: 'Emmanuel Demey',
  // The workshops are written in French, as those of the elasticsearch training.
  lang: 'fr',

  // One Markdown file per chapter, in the order of its number. What this
  // training shares with the elasticsearch one — the Elastic Stack, the Kibana
  // tour, Elastic Agent and Fleet — lives in ../elasticsearch-common/slides/ and
  // is imported by the chapters with Slidev's `src:`; its images are copied to
  // slides/public/images/common/ by `pnpm run sync`.
  slides: 'slides',
  workshops: 'workshops',
  // The workshops are guided: every request and its expected response is in
  // the README, run in Kibana against the learner's own stack. There is no code
  // to hand out, hence no solutions — and no online editor.
  solutions: false,

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'elastic-security' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Elastic Security for SIEM\nElastic Security for SIEM — 3 days: the stack and Fleet, ECS, Discover, visualizations and dashboards, the Security app, and a threat hunting capstone.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
