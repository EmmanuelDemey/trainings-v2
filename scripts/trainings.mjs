// The single list of what gets published. Adding a training here adds its
// workshops to the site (via site/scripts/sync-workshops.mjs) AND its deck to
// the build (via scripts/build-all.mjs).

export const REPO_URL = 'https://github.com/EmmanuelDemey/trainings-v2';
export const BRANCH = 'main';

export const TRAININGS = [
  {
    slug: 'javascript',
    label: 'JavaScript',
    /** Folder holding one sub-folder per workshop, each with a README.md. */
    workshops: 'training/chapters/javascript/tp',
    /** Slidev entry point, relative to training/. */
    deck: 'javascript.md',
    /** Worked answers, zipped for download on the Resources page. */
    solutions: 'training/solutions/javascript',
    /**
     * Opt-in: each workshop page gets an editor running in the browser
     * (StackBlitz WebContainers), loaded with the workshop folder — see
     * scripts/playground.mjs. These starters have no package.json: the online
     * copy gets one that serves the folder over http://, which is also what
     * `fetch`, ES modules and localStorage need.
     */
    playground: {
      template: 'node',
      openFile: ['app.js', 'index.html'],
      extraFiles: {
        'package.json': `${JSON.stringify(
          {
            private: true,
            scripts: { dev: 'serve --no-clipboard .' },
            devDependencies: { serve: '^14.2.6' },
          },
          null,
          2,
        )}\n`,
      },
    },
  },
  {
    slug: 'vuejs-advanced',
    label: 'Advanced Vue.js',
    workshops: 'training/chapters/vuejs_advanced/tp',
    deck: 'vuejs_advanced.md',
    solutions: 'training/solutions/vuejs_advanced',
    // `node` boots a WebContainer: `npm install`, then `npm run dev`, with a
    // terminal for `npm test` and `npm run typecheck`.
    playground: {
      template: 'node',
      openFile: ['README.md', 'src/App.vue'],
      limits:
        'Runs in Chrome, Edge or Firefox. What needs more than Node.js stays on your machine: ' +
        'the Vue Devtools browser extension (the in-page devtools of `vite-plugin-vue-devtools` ' +
        'do work), Cypress and Docker.',
    },
  },
  {
    slug: 'angular',
    label: 'Angular',
    workshops: 'training/chapters/angular/tp',
    deck: 'angular.md',
    // No `solutions`: the six workshops build one project, created by the learner
    // with `ng new` in workshop 1 — there is nothing to hand out per exercise. The
    // Resources page drops the ZIP link on its own when the key is absent.
  },
];
