// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'React Query',
  // Prefixes the downloads: tanstack-query-react-slides.pdf, …
  slug: 'tanstack-query-react',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. What the React,
  // Angular and Vue trainings have in common — the concepts, the retro — lives
  // in ../tanstack-query-common/slides/ and is imported by each chapter with
  // Slidev's `src:`. See ../tanstack-query-common/CURRICULUM.md.
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: each workshop is a Vite project, run as is. The build
  // syncs the shared fake API and specs into every workshop first, so the
  // online copy has them.
  playground: {
    template: 'node',
    openFile: ['README.md', 'src/App.tsx'],
    limits:
      'Everything runs online: Vite, `npm test`, `npm run typecheck` and the React Query devtools (the floating button at the top right of the app).',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'tanstack-query-react' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## React Query\nTanStack Query for React — 1 day, based on TanStack Query 5 and React 19.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
