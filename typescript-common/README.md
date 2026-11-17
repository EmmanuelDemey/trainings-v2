# TypeScript — what the two trainings share

Not a training: the material that the two TypeScript trainings have in common,
written once.

| Training | Folder | Snippets |
|---|---|---|
| TypeScript | [`../typescript`](../typescript) | plain TypeScript, Node.js |
| TypeScript for React developers | [`../typescript-react`](../typescript-react) | React 19, `.tsx` |

**Exactly the same content, different snippets.** Same chapters, same slides in
the same order, same titles, same quiz answers, same workshop steps. Only the
code examples change.

```
slides/<NN>_<chapter>/*.md   the slides with no training-specific code: learning
                             objectives, tables, talks, code-free quizzes
slides/retro.md              the end-of-day retro
scripts/parity.mjs           checks that the two trainings did not drift apart
```

## How a training uses it

A chapter (`slides/05_generics.md`) imports the common slides with Slidev's
`src:`, between its own slides — the ones with code:

```md
---
src: ../../typescript-common/slides/05_generics/learning-objectives.md
---
```

A slide with code is written twice, once in each training, under the **same
title**: the snippet changes, the teaching point does not. A slide whose code is
the same in both trainings (a `tsconfig.json`, a type-only quiz) belongs here.

## Keeping the two in sync

```bash
node typescript-common/scripts/parity.mjs
```

It compares, chapter by chapter, the outline of the two decks — the `# ` titles
and the `src:` imports, in order — and, workshop by workshop, the numbered steps
of the READMEs and the rows of their "at a glance" table. Both trainings run it
in `pnpm run check`.

Changing the text of a common slide: edit it here, both decks follow. Adding,
removing or moving a slide with code: do it in both trainings, the check fails
until then.

## Deploying

Each training is its own Netlify site, built from its own folder. Both reach
this folder from their `package.json` scripts (`../typescript-common/`), so a
change here redeploys both (`scripts/trainings-to-deploy.mjs`).
