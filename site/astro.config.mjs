// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const REPO = 'https://github.com/EmmanuelDemey/trainings-v2';

// https://astro.build/config
export default defineConfig({
  // Netlify exposes the deploy URL at build time: DEPLOY_PRIME_URL on branch and
  // preview deploys, URL on production. Starlight needs it for canonical URLs and
  // the sitemap; locally it is simply absent, which is fine.
  site: process.env.DEPLOY_PRIME_URL || process.env.URL || undefined,
  // The site is served from the domain root — the decks live under /slides/.
  // Set `base` only if you move it into a sub-path.
  integrations: [
    starlight({
      title: 'Workshops',
      description:
        'The hands-on workshops of the trainings — instructions, steps and acceptance criteria.',
      social: [{ icon: 'github', label: 'GitHub', href: REPO }],
      // Pages are generated from the workshop READMEs, so "Edit this page" has to
      // point at the README, not at the generated file. Each page carries its own
      // `editUrl` in frontmatter; this only turns the feature on.
      editLink: { baseUrl: `${REPO}/edit/main/` },
      lastUpdated: false,
      sidebar: [
        {
          label: 'JavaScript',
          items: [{ autogenerate: { directory: 'javascript' } }],
        },
        {
          label: 'Advanced Vue.js',
          items: [{ autogenerate: { directory: 'vuejs-advanced' } }],
        },
        {
          // Built by `node scripts/build-all.mjs` into build/slides/, next to
          // this site. They 404 under `astro dev`, which only serves the site.
          label: 'Slides',
          items: [
            { label: 'JavaScript deck', link: '/slides/javascript/' },
            { label: 'Advanced Vue.js deck', link: '/slides/vuejs-advanced/' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
