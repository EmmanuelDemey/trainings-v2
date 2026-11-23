# TP 3 — Does this feature need AI?

> Take four AI features proposed for ReBoot, question each one with the frugal AI grid, and decide what to build.

**Duration**: 30 min, in groups of 3–4 · **Chapter**: 4 — Frugal AI

## Goal

Chapter 4 — The most frugal AI is often no AI at all. The AFNOR Spec 2314
asks a series of questions, in order: answering them on real proposals is how
you learn to say *"yes, but smaller"* — or *"no"*.

There is no code in this workshop, and nothing to run `verify` on.

## Setup

The product team of ReBoot, the shop of refurbished phones, comes with four
proposals. Each group takes **one** (or all four, if time allows):

1. **A shopping assistant** — a chatbot on every page, powered by a large
   language model, that answers questions about the phones.
2. **Generated descriptions** — a large model writes the description of each
   refurbished phone from its model name and grade. About 200 new phones a day.
3. **Photo grading** — the technicians take a photo of each returned phone;
   a model detects the scratches and suggests a grade (*Like new*, *Very good*,
   *Good*).
4. **Personalised home page** — a recommendation model reorders the products
   for each visitor, computed at each page view.

## Steps

For your proposal, answer the grid of chapter 4, **in order**, with one line
each. Stop as soon as an answer settles it.

1. **Is there a need?** Who asked? What do users do today? How would you know
   it works?
2. **Does it need AI?** Could a rule, a search, a FAQ, a filter or a template
   do it?
3. **Does it need *generative* AI?** Or a classifier, a small specialised model?
4. **Which model?** The smallest one that is good enough.
5. **How often?** Precomputed once, cached, or at every request?
6. **Where?** On the device, or in a data centre — which one?
7. **Measured how?** Which figure, per request and per month?

Then estimate the **volume**: requests per day, and what changes between your
decision and the original proposal.

## Deliverable

For your proposal: the grid, filled in, and a **decision** in one sentence —
*build it as proposed*, *build a smaller version*, or *do not build it* — that
you defend to the room in **2 minutes**.

## Checking your work

Nothing automated. You are done when:

- every question you reached has an answer, and you stopped where it was settled;
- the decision states what is built, and what is not;
- the volume before and after is estimated.

Compare with the sample in `solutions/03_frugal_ai/`.

## Going further

- Estimate the footprint per request of the original proposal with
  [EcoLogits](https://ecologits.ai/) (calculator), then of your decision.
- Which **RGESN 2024** criteria of the "Algorithms" family does your decision meet?

## Useful links

- [AFNOR Spec 2314 — frugal AI](https://www.afnor.org/actualites/referentiel-pour-mesurer-et-reduire-impact-environnemental-de-ia/)
- [EcoLogits](https://ecologits.ai/)
- [IEA — Energy and AI](https://www.iea.org/reports/energy-and-ai)
