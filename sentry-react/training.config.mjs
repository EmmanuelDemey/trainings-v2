// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Sentry for React',
  // Prefixes the downloads: sentry-react-slides.pdf, …
  slug: 'sentry-react',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. What the React
  // and NestJS trainings have in common — the concepts, the retro — lives in
  // ../sentry-common/slides/ and is imported by each chapter with Slidev's
  // `src:`. See ../sentry-common/CURRICULUM.md.
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: each workshop is a Vite project, run as is. The build
  // syncs the shared test kit into every workshop first, so the online copy
  // has it.
  playground: {
    template: 'node',
    openFile: ['README.md', 'src/sentry.ts'],
    limits:
      'Everything runs online: Vite, `npm test` and `npm run typecheck`. Spotlight (the local Sentry UI) and the source map upload need your own machine.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'sentry-react' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Sentry for React\nError monitoring, tracing, Session Replay and User Feedback for React apps — 1 day, based on the Sentry JavaScript SDK 11 and React 19.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
