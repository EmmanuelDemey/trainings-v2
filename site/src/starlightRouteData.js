// One menu per training.
//
// Starlight builds a single sidebar from the whole config, which would put the
// JavaScript workshops and the Vue.js ones side by side in the same menu. Each
// training is its own space here: inside /javascript/ the sidebar shows the
// JavaScript group and nothing else, with one link back to the training picker.
//
// Wired up by `routeMiddleware` in astro.config.mjs.

import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { TRAININGS } from '../../scripts/trainings.mjs';

const link = (label, href, isCurrent = false) => ({
  type: 'link',
  label,
  href,
  isCurrent,
  badge: undefined,
  attrs: {},
});

/** The ordered list of links inside a sidebar tree — what prev/next walks. */
const flatten = (entries) =>
  entries.flatMap((entry) => (entry.type === 'group' ? flatten(entry.entries) : entry));

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const [segment] = context.url.pathname.split('/').filter(Boolean);
  const training = TRAININGS.find((candidate) => candidate.slug === segment);

  // Outside a training — the home page, a 404: offer the trainings themselves.
  if (!training) {
    route.sidebar = TRAININGS.map((candidate) => link(candidate.label, `/${candidate.slug}/`));
    route.pagination = { prev: undefined, next: undefined };
    return;
  }

  const group = route.sidebar.find(
    (entry) => entry.type === 'group' && entry.label === training.label,
  );
  if (!group) return;

  route.sidebar = [link('← All trainings', '/'), group];

  // Pagination is computed from the full sidebar, before this middleware runs:
  // without recomputing it, "Next" on the last JavaScript page walks into Vue.js.
  // The back link is deliberately left out of it.
  const links = flatten(group.entries);
  const index = links.findIndex((entry) => entry.isCurrent);
  route.pagination =
    index === -1
      ? { prev: undefined, next: undefined }
      : { prev: links[index - 1], next: links[index + 1] };
});
