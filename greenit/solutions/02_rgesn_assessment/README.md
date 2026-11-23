# TP 2 — A RGESN self-assessment: a sample on ReBoot

> The expected outcome of workshop 2: ReBoot assessed on 15 criteria of the RGESN 2024, and three priorities.

If you assessed your own service, your table will be different: use this one to
check its **form** — one criterion per line, a status, an evidence, an owner.

The criteria are named by their **subject**: their numbers and exact wording
are in the RGESN 2024; check them there.

## The assessment

| Family | Criterion | Status | Evidence | Who |
|---|---|---|---|---|
| Strategy | The need is identified, the features are used | not met | the reviews block was asked by marketing, no data on its use | product |
| Strategy | Environmental objectives are set and followed | not met | no target, no measure | product + management |
| Specifications | Old devices and OS versions are supported | not met | no list, tested on recent devices only | product + dev |
| Specifications | The service works on a slow connection | not met | 10 MB on the home page: a minute on 3G | dev |
| Architecture | Data refreshed only when needed | not met | the stock is fetched every second | dev |
| UX/UI | Content loaded on demand, not by default | not met | 400 reviews in the DOM, hidden | design + dev |
| UX/UI | No autoplay of videos or animations | met | none on the page | — |
| Content | Images resized to their display size | not met | 1000 px PNGs shown at 240 px | content + dev |
| Content | Images in an efficient format | not met | PNG for photos | content + dev |
| Front-end | No unused code is loaded | not met | 200 kB of `everything.js` for one function | dev |
| Front-end | Offscreen images lazy-loaded | not met | all 7 images at once | dev |
| Back-end | Responses cached and compressed | not met | no cache headers, no compression | dev + ops |
| Hosting | Host with a known energy mix and PUE | not met | region chosen by default, not known | ops |
| Hosting | Hosted close to the users | not met | US region for French users | ops |
| Algorithms | AI is justified, measured | not applicable | no AI | — |

## By family

The **Strategy** and **Specifications** families fail entirely: nobody decided
what the service must run on, nor what it must weigh. The front-end failures
are the consequence.

## The three priorities

1. **Supported devices and a weight target** (Specifications, Strategy) — a
   product decision, no code: it makes every other fix measurable. *Product.*
2. **Images** (Content) — 95 % of the weight, a few hours of work. *Content +
   dev.* Workshop 4.
3. **Data refreshed only when needed** (Architecture) — the stock polled every
   second costs requests forever, on every open tab. *Dev.* Workshop 4.
