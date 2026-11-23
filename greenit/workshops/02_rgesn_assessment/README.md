# TP 2 — A RGESN self-assessment

> Assess a digital service against the RGESN 2024, find the families where it fails, and pick three criteria to work on first.

**Duration**: 40 min · **Chapter**: 2 — RGESN and the REEN law

## Goal

Chapter 2 — The RGESN is a list of yes/no questions. Answering them on a real
service is the fastest way to learn the framework, and to see that most of the
impact is decided **before** a line of code.

There is no code in this workshop, and nothing to run `verify` on.

## Setup

Choose the service you assess:

- **one of your own**, the one you work on (the most useful choice), or
- **ReBoot**, the shop of refurbished phones of workshop 4. Serve the starter
  and open it:

  ```bash
  cd workshops/04_frugal_page
  npx serve .
  ```

  Its "specifications", for the criteria you cannot see in the page:
  - no list of supported devices; tested on the latest iPhone and on Chrome desktop;
  - hosted in the US by a large cloud provider, region chosen by default;
  - no analytics on the use of the features; the reviews block was asked by marketing;
  - no target of weight or of performance; no measure in the CI.

Open the **RGESN 2024** in a tab, and its online tool if you want to export a
statement: [ecoresponsable.numerique.gouv.fr](https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/).

## Steps

1. **Scope** — write one line: which service, which pages, which users.
2. **Pick 15 criteria** — at least one in each of the 9 families
   (Strategy, Specifications, Architecture, UX/UI, Content, Front-end,
   Back-end, Hosting, Algorithms). Prefer the ones of **high priority**.
3. **Answer each one** — *met*, *not met*, *not applicable*, with one line
   of evidence: what you saw, or what is missing.
4. **Count by family** — where are the most *not met*?
5. **Pick three** — the three criteria to work on first. For each: **who** in
   the team can act on it, and **how hard** it is.

## Deliverable

A table:

| Family | Criterion | Status | Evidence | Who |
|---|---|---|---|---|
| Specifications | 2.1 — supports old devices | not met | no list, tested on recent devices only | product + dev |

then the three criteria you pick, and why.

## Checking your work

Nothing automated. You are done when:

- the 9 families are covered;
- every answer has its evidence;
- the three priorities each have an owner.

If you assessed ReBoot, compare with the sample in
`solutions/02_rgesn_assessment/`.

## Going further

- Fill in the **statement of eco-design** with the online tool, and export it.
- Read the same three criteria in the **GR491** of the INR: what does it add?

## Useful links

- [RGESN 2024](https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/)
- [GR491 — INR](https://gr491.isit-europe.org/)
