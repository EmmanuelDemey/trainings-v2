# Workshops site

A [Starlight](https://starlight.astro.build) site that publishes the **workshop
instructions** of the trainings. Two trainings are exposed for now: **JavaScript**
and **Advanced Vue.js**.

```bash
pnpm install
pnpm run dev      # http://localhost:4321
pnpm run build    # static site in dist/
```

## Where the content comes from

Nothing is written by hand. `scripts/sync-workshops.mjs` reads the `README.md` of
every workshop and generates one Starlight page per workshop:

```
training/chapters/javascript/tp/03_syntax/README.md
   ➜ src/content/docs/javascript/03-syntax.md
training/chapters/vuejs_advanced/tp/09_pinia/README.md
   ➜ src/content/docs/vuejs-advanced/09-pinia.md
```

It also generates, per training:

- an **Overview** page: a table linking to every workshop, followed by whatever
  the training's own `tp/README.md` says. The index comes first so the overview
  never reads as "all the workshops dumped on one page";
- a **Resources** page (last in the sidebar): the participant kit (a ZIP of both
  PDFs and the workshop folders, without the solutions), the deck online, the deck
  as a PDF, the workshops as one printable handbook (PDF), and the worked
  solutions as a ZIP. Those four files are produced by `scripts/build-all.mjs` into
  `build/downloads/`, and **a link is only rendered if the file is actually
  there** — the PDF export of a very large deck can fail without that taking the
  deploy down.
- a **Feedback** page, after Resources: the end-of-training form (see below),
  plus the thank-you page it posts to, hidden from the menu and from the search
  index.

Each workshop page also opens with a **theory quiz** (see below) and gets its
own correction page, `<workshop>-answers`, hidden the same way.

For each workshop page the script derives:

- the **title**, from the leading `# ` heading (removed from the body — Starlight
  renders its own `h1`, keeping it would show the title twice);
- the **description**, from the blockquote under the title;
- the **sidebar order and label**, from the folder name (`03_syntax` ➜ order 3,
  label `3. Functions and arrays`);
- the **edit link**, pointing at the original `README.md` on GitHub;
- a note saying which folder to open.

The generated folders are **gitignored**. The source of truth is the workshop
folder, where the learner actually works — never the copy under `src/`.
`pnpm run dev` and `pnpm run build` both run the sync first, so the site cannot
drift from the workshops.

## One menu per training

The trainings do not share a menu. Inside `/javascript/` the sidebar shows the
JavaScript group and nothing else, plus one link back to the picker at `/`.

Starlight builds a single sidebar out of the whole config, so the narrowing is
done per route in `src/starlightRouteData.js`, registered as `routeMiddleware`.
It also recomputes prev/next — pagination is derived from the *full* sidebar
before middleware runs, so without that the last JavaScript page would link into
the first Vue.js one.

The groups themselves are generated from `TRAININGS`; `astro.config.mjs` has no
hand-written list.

## The theory quiz

Every workshop page opens with a handful of multiple-choice questions on the
chapter it follows, submitted as a [Netlify form](https://docs.netlify.com/manage/forms/overview/)
and answered on a correction page the form redirects to. One form per workshop
(`quiz-javascript-03-syntax`), so the Netlify UI shows the answers grouped by
workshop rather than in one pile.

The questions come from two places, resolved by
[`../scripts/quizzes/`](../scripts/quizzes/):

- **Advanced Vue.js** — parsed out of the deck. Every chapter already ends with
  `# Quiz — Question n / m` slides holding the question, four options and the
  answer with its explanation, so the site reads those rather than copying them.
  Change a chapter and the workshop quiz follows.
- **JavaScript** — the deck has no quiz slides, so the questions are written in
  `../scripts/quizzes/javascript.mjs`, against the chapter each workshop follows.

A workshop absent from `QUIZ_SOURCES` simply gets no quiz and no correction page.

The form is emitted as **raw HTML inside a Markdown page**
([`scripts/quiz-render.mjs`](scripts/quiz-render.mjs)), which forbids a blank
line anywhere inside it: a blank line closes an HTML block in CommonMark and the
rest of the form would be parsed as Markdown. `lines()` enforces that.

Two things to know before relying on it:

- the correction page is **public** and its URL is guessable. This is a warm-up,
  not an exam — a static site has nowhere to hide an answer key;
- the Netlify free plan caps form submissions. One class going through twelve
  workshops is over a hundred submissions.

## Working online

A training that declares a `playground` in `scripts/trainings.mjs` (JavaScript and
Advanced Vue.js for now) gets a **"work online"** block at the top of each
workshop page: a VS Code-like editor with a terminal, running in the browser on
[StackBlitz WebContainers](https://webcontainers.io). Nothing to install on the
learner's machine — `npm install`, `npm run dev`, `npm test` all run in the tab.

- `scripts/sync-workshops.mjs` packs each workshop folder into
  `public/playgrounds/<training>/<workshop>.json` (gitignored), through
  `scripts/playground.mjs` at the root. The files come from the checkout, not
  from GitHub, so a deploy preview opens the starter of its own branch.
  `node_modules`, `dist` and binaries are left out.
- The JavaScript starters have no `package.json`: the online copy gets one that
  serves the folder with `serve` (`extraFiles` in `scripts/trainings.mjs`). The
  repository is not changed.
- `src/components/MarkdownContent.astro` (a Starlight override) holds the script.
  Nothing is downloaded until the learner clicks: **Open the online editor
  here** embeds it in the page, **Open it in a new tab** opens stackblitz.com.
- The embed needs the page to be **cross-origin isolated**:
  `scripts/build-all.mjs` writes `Cross-Origin-Opener-Policy` and
  `Cross-Origin-Embedder-Policy` into `build/_headers` for those trainings only,
  and `astro.config.mjs` sends the same headers under `astro dev`. Where the page
  is not isolated (Safari, another host), only the new-tab button is shown.
  With `require-corp`, those pages cannot load a cross-origin image or script
  that does not opt in — keep workshop READMEs on local assets.
- Changes live in the learner's browser tab. To keep them, they fork the project
  on StackBlitz (free account) or copy the files back.

## The feedback form

`src/components/FeedbackForm.astro`, placed by the generated `feedback.mdx` of
each training. It is a [Netlify form](https://docs.netlify.com/manage/forms/overview/):
plain HTML, no backend, no JavaScript — Netlify collects the submissions by
parsing the deployed markup, so the form must render statically.

Each training has its own form name (`feedback-javascript`,
`feedback-vuejs-advanced`), so the answers arrive in two separate lists rather
than one pile to sort by hand. Two consequences worth knowing:

- a form only exists once a **production** deploy has contained it — submissions
  made from a deploy preview are not collected;
- **form detection has to be enabled** for the project in the Netlify UI
  (Project configuration ➜ Forms), otherwise the markup is deployed and ignored.

## Publishing another training

One entry in the `TRAININGS` array of `../scripts/trainings.mjs` — the single
list shared with the deck build. Nothing to add here:

```js
{
  slug: 'node',
  label: 'Advanced Node.js',
  workshops: 'training/chapters/node/tp',
  deck: 'node.md',
  solutions: 'training/solutions/node',
}
```

## The solutions

They are published, as a ZIP on each Resources page, behind an explicit warning:
a learner who reads the answer first never sees the problem the answer is for.
Open them after the correction, to compare with what you wrote.

## Before deploying

Set `site` — and `base` if the site is not served from the domain root — in
`astro.config.mjs`. Starlight needs them for canonical URLs and the sitemap.
The build output is fully static: any host will do.
