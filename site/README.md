# Workshops site

A [Starlight](https://starlight.astro.build) site that publishes the **workshop
instructions** of the trainings. Two trainings are exposed for now: **JavaScript**
and **Advanced Vue.js**.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where the content comes from

Nothing is written by hand. `scripts/sync-workshops.mjs` reads the `README.md` of
every workshop and generates one Starlight page per workshop:

```
training/chapters/javascript/tp/03_syntax/README.md
   ➜ src/content/docs/javascript/03-syntax.md
training/chapters/vuejs_advanced/tp/06_pinia/README.md
   ➜ src/content/docs/vuejs-advanced/06-pinia.md
```

For each page the script derives:

- the **title**, from the leading `# ` heading (removed from the body — Starlight
  renders its own `h1`, keeping it would show the title twice);
- the **description**, from the blockquote under the title;
- the **sidebar order and label**, from the folder name (`03_syntax` ➜ order 3,
  label `3. Functions and arrays`);
- the **edit link**, pointing at the original `README.md` on GitHub;
- a note saying which folder to open.

The generated folders are **gitignored**. The source of truth is the workshop
folder, where the learner actually works — never the copy under `src/`.
`npm run dev` and `npm run build` both run the sync first, so the site cannot
drift from the workshops.

## Publishing another training

One entry in the `TRAININGS` array of `scripts/sync-workshops.mjs`, and one group
in the `sidebar` of `astro.config.mjs`:

```js
{ slug: 'node', label: 'Advanced Node.js', source: 'training/chapters/node/tp' }
```

## What is deliberately not published

The **solutions** (`training/solutions/`). A learner who reads the answer first
never sees the problem the answer is for.

## Before deploying

Set `site` — and `base` if the site is not served from the domain root — in
`astro.config.mjs`. Starlight needs them for canonical URLs and the sitemap.
The build output is fully static: any host will do.
