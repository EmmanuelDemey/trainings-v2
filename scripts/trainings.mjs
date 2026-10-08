// The single list of what gets published. Adding a training here adds its
// workshops to the site (via site/scripts/sync-workshops.mjs) AND its deck to
// the build (via scripts/build-all.mjs).

export const REPO_URL = 'https://github.com/EmmanuelDemey/trainings-v2';
export const BRANCH = 'main';

// JavaScript and Advanced Vue.js are no longer here: each is its own
// training-kit project, in javascript/ and vuejs-advanced/, deployed to its own
// Netlify site.
export const TRAININGS = [
  {
    slug: 'angular',
    label: 'Angular',
    /** Folder holding one sub-folder per workshop, each with a README.md. */
    workshops: 'training/chapters/angular/tp',
    /** Slidev entry point, relative to training/. */
    deck: 'angular.md',
    // No `solutions`: the six workshops build one project, created by the learner
    // with `ng new` in workshop 1 — there is nothing to hand out per exercise. The
    // Resources page drops the ZIP link on its own when the key is absent.
  },
];
