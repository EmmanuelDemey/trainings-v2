// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'JavaScript',
  // Keeps the names of the downloads the previous site published:
  // javascript-slides.pdf, javascript-workshops.pdf, …
  slug: 'javascript',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. The three
  // optional modules (_10_fetch.md, _11_modules.md, _12_storage.md) are turned
  // off by their leading underscore: to teach one, rename the chapter AND its
  // workshop (workshops/_13_fetch/) and solution (solutions/_13_fetch/).
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder. The workshops are plain HTML with no package.json: the
  // online copy alone gets one, which serves the folder over http:// — what
  // the optional modules (fetch, ES modules, storage) need anyway.
  playground: {
    template: 'node',
    openFile: ['README.md', 'app.js', 'index.html'],
    extraFiles: {
      'package.json': `${JSON.stringify(
        {
          name: 'javascript-workshop',
          private: true,
          scripts: { start: 'serve .' },
          devDependencies: { serve: '^14.2.6' },
        },
        null,
        2,
      )}\n`,
      '.stackblitzrc': `${JSON.stringify({ installDependencies: true, startCommand: 'npm start' }, null, 2)}\n`,
    },
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'javascript' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## JavaScript\nJavaScript training for beginners — 3 days.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
