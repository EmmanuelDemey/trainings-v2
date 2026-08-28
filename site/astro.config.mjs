// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { TRAININGS, REPO_URL } from '../scripts/trainings.mjs';

// https://astro.build/config
export default defineConfig({
  // Netlify exposes the deploy URL at build time: URL is the site's own address on
  // every context, DEPLOY_PRIME_URL the address of this particular deploy. Starlight
  // needs one for canonical URLs and the sitemap; locally both are absent, which is
  // fine — the tags are then simply not emitted.
  //
  // URL comes first on purpose. The pages carry it in `og:url` and `<link rel=
  // canonical>`, and netlify-plugin-checklinks resolves absolute URLs against
  // process.env.URL to map them back onto the built files. Stamping DEPLOY_PRIME_URL
  // instead makes every one of those look external on a branch or preview deploy: the
  // plugin then fetches them over the network, from a site that has not been deployed
  // yet, and the build fails on pages the deploy is about to create.
  //
  // It also means a preview points its canonical at production, which is what you
  // want anyway — a preview should never be the canonical of anything.
  site: process.env.URL || process.env.DEPLOY_PRIME_URL || undefined,
  // The site is served from the domain root — the decks live under /slides/.
  // Set `base` only if you move it into a sub-path.
  integrations: [
    starlight({
      title: 'Workshops',
      description:
        'The hands-on workshops of the trainings — instructions, steps and acceptance criteria.',
      social: [{ icon: 'github', label: 'GitHub', href: REPO_URL }],
      // Pages are generated from the workshop READMEs, so "Edit this page" has to
      // point at the README, not at the generated file. Each page carries its own
      // `editUrl` in frontmatter; this only turns the feature on.
      editLink: { baseUrl: `${REPO_URL}/edit/main/` },
      lastUpdated: false,
      // One group per training. Only the group of the training you are currently
      // in is kept in the sidebar — see src/starlightRouteData.js.
      sidebar: TRAININGS.map((training) => ({
        label: training.label,
        items: [
          { autogenerate: { directory: training.slug } },
          {
            // Built by `node scripts/build-all.mjs` into build/slides/, next to
            // this site. It 404s under `astro dev`, which only serves the site.
            label: 'Slides — the deck',
            link: `/slides/${training.slug}/`,
          },
        ],
      })),
      routeMiddleware: './src/starlightRouteData.js',
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
