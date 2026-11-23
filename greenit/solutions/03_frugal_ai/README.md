# TP 3 — Does this feature need AI? A sample of decisions

> The expected outcome of workshop 3: the four ReBoot proposals through the frugal AI grid, and a decision for each.

There is no single right answer: what matters is that each decision follows
from the questions, **in order**, and stops where it is settled.

## 1. A shopping assistant

- **Need?** No one asked: the support team receives about 30 questions a day,
  80 % of them on **delivery**, **warranty** and **battery health**.
- **AI?** Not needed for those: a **FAQ** and a battery health figure on each
  product page answer them.
- **Decision — do not build it.** Write the FAQ, add the battery figure. If a
  need remains later, an assistant on the **support page only**, retrieving
  from the FAQ (RAG) with a small model, not on every page.
- **Volume** — from one model call per page view (tens of thousands a day) to
  zero.

## 2. Generated descriptions

- **Need?** Yes: 200 phones a day, written by hand today.
- **AI?** The variable part is small: model, grade, battery, storage. A
  **template** per phone model covers it.
- **Decision — a smaller version.** A template per **model** (≈ 150 models),
  written **once** — by a person, or by a model, then reviewed. Nothing at each
  new phone.
- **Volume** — from 200 generations a day, forever, to ≈ 150 once.

## 3. Photo grading

- **Need?** Yes: grading is slow and inconsistent between technicians.
- **AI?** Yes: detecting scratches on a photo is what a vision model does well.
- **Generative?** No: a **small classifier** (three grades), trained on the
  photos already graded by the technicians.
- **Where?** On the technician's **workstation**, no data centre needed;
  a suggestion the technician confirms.
- **Decision — build it, small.**
- **Measured** — the share of suggestions accepted, and the energy of one
  inference on the workstation.

## 4. Personalised home page

- **Need?** Unclear: there are 6 to 50 products. Is a ranking per visitor
  better than "best sellers in stock"?
- **AI?** Try without first: sort by **stock and sales**, A/B-test it.
- **How often?** If it is ever built: **precomputed** once a day per segment,
  never at each page view.
- **Decision — do not build it now.** A sort by stock and sales, measured. Come
  back with data.
- **Volume** — from one inference per page view to none, or a few per day.
