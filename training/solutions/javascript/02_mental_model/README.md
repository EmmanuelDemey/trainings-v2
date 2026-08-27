# TP 2 — Sketching snippets

> Autonomous workshop — chapter 2 (Mental model). ~45 minutes.

## Goal

Stop *running* code to know what it does, and start **predicting** it. You will
draw the wires-and-values diagram of eight snippets, write down your prediction,
and only then let the browser tell you whether you were right.

## Setup

Open `index.html`. The page itself is deliberately empty: everything happens in
the console. Have paper (or a whiteboard) next to you.

## Steps

1. **Draw first.** For each snippet in `app.js`, draw the diagram: one box per
   value, one arrow per variable. Move the arrows as the code runs.
2. **Predict.** Replace each `PREDICT_ME` with the value you expect. The page
   compares your prediction with reality and prints ✅ or ❌ per snippet.
3. **Only then, run.** Reload the page and read the console.
4. **Explain the failures out loud.** A ❌ is the useful part of this workshop:
   say why the value is what it is before you fix your prediction.
5. **`{} === {}`** — snippet 6. Answer the question in the comment: two objects
   that look identical, why are they not equal?
6. **Truthy / falsy** — implement `isTruthy(value)` at the bottom **without
   using `Boolean()`**, then let the checker run it over 12 values.

## Checking your work

The console ends with `8/8 predictions correct` and `12/12 classified`.

## Going further

- Add `typeof` to each snippet and predict that too. `typeof null` will surprise
  you.
- Predict `[] == false`, `'' == 0`, `null == 0`, `NaN == NaN`. Then read the
  coercion table on MDN and be glad you always write `===`.
- `const frozen = Object.freeze({ a: 1 }); frozen.a = 2;` — what does `frozen.a`
  hold afterwards, and does it throw?
