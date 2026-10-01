# training-kit

What this repository does for its trainings — a Slidev deck, a workshops site
with an online editor, the PDFs and the ZIPs — packaged so that a new training
only has to say where its slides and its workshops are.

```bash
npm create training-kit my-training
cd my-training
npm install
npm run dev        # the deck, live
npm run site       # the workshops site, live
npm run build      # everything, into build/
```

```
framework/
  packages/
    training-kit/          @emmanueldemey/training-kit: the library and its CLI (list, slides, site, build)
    create-training-kit/   `npm create training-kit`: scaffolds a training
```

The user documentation of each package — what npm shows on its page — is its
own README: [training-kit](packages/training-kit/README.md) (configuration,
commands, the build, the API) and
[create-training-kit](packages/create-training-kit/README.md) (the generator's
options and what it writes). This one is about the framework as a whole, and
about developing it.

## The one rule: the number in the name

A training is two folders, set in `training.config.mjs`:

```js
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Advanced Vue.js',
  slides: 'slides', // 1-introduction.md, 2-reactivity.md, …
  workshops: 'workshops', // 1-devtools/README.md, 2-composables/README.md, …
});
```

The number a name starts with is its place — in the deck, on the site, in the
handbook, in the ZIPs:

| Name                                      |                                                          |
| ----------------------------------------- | -------------------------------------------------------- |
| `1-intro.md`, `01_intro.md`, `1 intro.md` | chapter 1 — any separator, any padding                   |
| `10-testing.md`                           | chapter 10, **after** 9: the sort is numeric             |
| `_11-optional.md`                         | turned off: kept on disk, left out of everything         |
| `notes.md`                                | no number: left out, and reported by `training-kit list` |
| `3-a.md` + `03-b.md`                      | an error: two chapters cannot share a place              |

The same rule picks the workshop folders. A workshop's solution is the folder of
`solutions/` with **the same name**: `workshops/3-routing/` (instructions and
starter code) goes with `solutions/3-routing/`. The build reports a workshop
without a solution, and a solution folder that matches no workshop. There is no list to keep in sync
anywhere else: adding `slides/7-forms.md` adds chapter 7 to the deck, even to
one already open in `training-kit slides`.

## What training-kit generates

| From                      | It generates                                                                 | Where                                   |
| ------------------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| `slides/*.md`             | the Slidev entry: a cover, then one `src:` import per chapter                | `slides/deck.generated.md` (gitignored) |
| `workshops/*/README.md`   | a Starlight site: overview, one page per workshop, resources                 | `.training-kit/site/` (gitignored)      |
| each workshop folder      | a StackBlitz project, opened on the workshop page ("VS Code" in the browser) | `build/playgrounds/`                    |
| the built deck            | `<slug>-slides.pdf`, printed slide by slide                                  | `build/downloads/`                      |
| the workshop READMEs      | `<slug>-workshops.pdf`: cover, contents, one workshop per page               | `build/downloads/`                      |
| `solutions/`              | `<slug>-solutions.zip`                                                       | `build/downloads/`                      |
| each workshop folder      | `<n-name>-starter.zip`, linked on its page and in Resources                  | `build/downloads/tp/`                   |
| `solutions/<n-name>/`     | `<n-name>-solution.zip` — paired with `workshops/<n-name>/` by its name      | `build/downloads/tp/`                   |
| both PDFs + the workshops | `<slug>-participants.zip`, without the solutions                             | `build/downloads/`                      |

The deck entry is written **into** the slides folder because Slidev takes the
entry's folder as the deck's root: `components/`, `public/`, `styles/`,
`layouts/` next to the chapters work exactly as Slidev documents them.

The site, the PDFs and the online editor come from the trainings of this
repository: `scripts/build-all.mjs`, `training/scripts/deck-pdf.mjs`,
`training/scripts/workshops-pdf.mjs`, `site/scripts/sync-workshops.mjs` and the
StackBlitz integration of the `claude/starlight-vscode-integration` branch. The
theory quizzes and the feedback form are not part of it: they are Netlify Forms
specific to this repository.

## Dependencies

Slidev, Astro and Starlight are **peer dependencies** of training-kit: the
training pins their versions in its own `package.json`, and can move to a newer
Slidev without waiting for a training-kit release. `create-training-kit` writes
a set of versions known to work together.

Under pnpm, the generated `pnpm-workspace.yaml` turns `shamefullyHoist` on —
Astro resolves some of its own dependencies from the folder it builds, which
pnpm's strict layout hides.

## Developing the framework

```bash
cd framework
pnpm install       # also installs the pre-commit hook (husky)
pnpm test          # Vitest, both packages — `--project create-training-kit` for one
pnpm run check     # everything the CI checks, in one go
```

| Script                           | Tool   | Fails on                                           |
| -------------------------------- | ------ | -------------------------------------------------- |
| `format:check` (`format` to fix) | oxfmt  | a file not formatted — `.oxfmtrc.json`             |
| `lint`                           | oxlint | any error or warning — `.oxlintrc.json`            |
| `knip`                           | knip   | an unused file, export or dependency — `knip.json` |
| `cpd`                            | jscpd  | any clone of 50 tokens or more — `.jscpd.json`     |
| `test`                           | Vitest | a failing spec — `vitest.config.mjs`               |

The create-training-kit template is left out of the format and lint checks: its
`training.config.mjs` holds `{{placeholders}}`, which are not JavaScript until a
training is scaffolded.

**Pre-commit hook.** `pnpm install` runs `husky framework/.husky` from the
repository root, which sets `core.hooksPath` for the whole repository. The hook
runs `pnpm run check`, and only when the commit touches `framework/` — commits
elsewhere in the repository are not slowed down. To remove it:
`git config --unset core.hooksPath`.

**CI.** `.github/workflows/framework.yml` runs on every pull request (and push to
main) that touches `framework/`: one job per check, the tests of each package
apart, then a training scaffolded with the training-kit of the commit is
installed with npm and built (`build:fast`), and every part of `build/` is checked.

To try an unreleased training-kit in a new training:

```bash
node packages/create-training-kit/index.mjs ../../my-training --yes \
  --title "My training" --kit "file:$PWD/packages/training-kit"
```

## Publishing

The library is published as **`@emmanueldemey/training-kit`** — the bare name
`training-kit` is held by npm as a security placeholder. Its command is still
`training-kit`. The generator keeps its unscoped name, which is what
`npm create training-kit` looks up.

```bash
npm login
cd packages/training-kit && npm publish            # first: new trainings depend on it
cd ../create-training-kit && pnpm publish          # pnpm rewrites its `workspace:*` dev dependency
```

`npm pack --dry-run` in either folder lists exactly what would be sent.
