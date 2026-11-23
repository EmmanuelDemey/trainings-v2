// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Green IT',
  slug: 'greenit',
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
    openFile: ['README.md', 'index.html', 'script.js'],
    extraFiles: {
      'package.json': `${JSON.stringify(
        {
          name: 'greenit-workshop',
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
      'The code runs online, but the editor leaves the pictures out (binaries): the weights you measure there are wrong. Workshops 4 and 5 — the GreenIT-Analysis extension, Lighthouse, `pnpm run measure` and `pnpm run verify` — need a local clone or the starter ZIP.',
  },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Green IT\nResponsible digital and eco-design — 1 day: impacts, RGESN, INR, frugal AI, measuring, auditing.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
