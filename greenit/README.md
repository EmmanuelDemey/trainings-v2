# Green IT

The material of the **Green IT** training (responsible digital and
eco-design, one day): a slide deck, hands-on workshops, and the site that
publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

It follows the programme of the training *Numérique Responsable :
éco-conception et Green IT*: the impacts of digital, the frameworks (RGESN 2024
and the REEN law, the 115 good practices, the INR framework, frugal AI and
AFNOR Spec 2314, the tools), and an eco-design approach (audit, continuous
monitoring, how to convince).

```
slides/                    one Markdown file per chapter (Slidev)
workshops/                 one folder per workshop: its README.md and the starter
solutions/                 the worked answers, one folder per workshop, same names
scripts/ecoindex.mjs       the EcoIndex algorithm, unit-tested
scripts/budget.mjs         the environmental budget check, unit-tested
scripts/measure.mjs        measures a page (Playwright): `pnpm run measure`
scripts/verify.mjs         the functional check of workshops 4 and 5
scripts/generate-assets.mjs  the pictures and the vendor bundle of ReBoot
training.config.mjs
```

## Write

```bash
pnpm install
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck and the site, live — http://localhost:3030 and :4321
pnpm run slides     # the deck alone, with Slidev's keyboard shortcuts
pnpm run site       # the workshops site alone
pnpm run check      # missing READMEs, broken links and images
pnpm test           # the unit tests of the EcoIndex and the budget
```

**The number at the start of a name is its place.** `slides/03_….md` is
chapter 3, `workshops/03_…/` is workshop 3. A name that starts with `_` is turned
off — kept on disk, left out of the deck, the site, the PDFs and the ZIPs. There
is no list to maintain anywhere else.

The figures of the slides move with each new study (ADEME–Arcep, IEA): check
them, and their sources, before each session.

## The pictures of ReBoot

The heavy PNGs of the starter of workshop 4, and the AVIF and WebP of the
solutions, are generated and committed:

```bash
pnpm run generate-assets
```

Run it only to change them. The starter is heavy **on purpose** (≈ 10 MB).

## Build

```bash
pnpm run build          # everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads are named after the slug: `greenit-slides.pdf`,
`greenit-workshops.pdf`, `greenit-solutions.zip`, `greenit-participants.zip`,
plus a starter and a solution ZIP per workshop under `downloads/tp/`.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder deploys it, and a pull request gets a preview.
Nothing to set up in the Netlify UI. [`netlify.toml`](netlify.toml) only carries
the headers.

## Checking the workshops

Workshops 4 and 5 are plain HTML with no `package.json`: the CI runs
[`scripts/verify.mjs`](scripts/verify.mjs) (`verifyScript: true` in
[`workshops.ci.mjs`](workshops.ci.mjs)) — the solutions must pass, the
starters must fail.

```bash
pnpm exec playwright install chromium        # once
pnpm run verify                              # the solutions
pnpm run verify --dir workshops              # the starters: they fail
```
