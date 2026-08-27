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
  },
  {
    slug: 'vuejs-advanced',
    label: 'Advanced Vue.js',
    workshops: 'training/chapters/vuejs_advanced/tp',
    deck: 'vuejs_advanced.md',
    solutions: 'training/solutions/vuejs_advanced',
  },
];
