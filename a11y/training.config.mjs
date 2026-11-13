// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Digital Accessibility',
  slug: 'a11y',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number.
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder. The workshops are plain HTML with no package.json: the
  // online copy alone gets one, which serves the folder over http://.
  playground: {
    template: 'node',
    openFile: ['README.md', 'index.html', 'create.html'],
    extraFiles: {
      'package.json': `${JSON.stringify(
        {
          name: 'a11y-workshop',
          private: true,
          scripts: { start: 'serve .' },
          devDependencies: { serve: '^14.2.6' },
        },
        null,
        2,
      )}\n`,
      '.stackblitzrc': `${JSON.stringify({ installDependencies: true, startCommand: 'npm start' }, null, 2)}\n`,
    },
    limits:
      'The pages run online. A screen reader, the browser extensions (axe DevTools) and `pnpm run verify` need a local clone.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'a11y' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Digital Accessibility\nDigital accessibility training — WCAG 2.2, semantic HTML, ARIA, auditing.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
